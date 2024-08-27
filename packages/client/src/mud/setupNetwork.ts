/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import {
  createPublicClient,
  custom,
  createWalletClient,
  Hex,
  parseEther,
  ClientConfig,
  getContract,
  zeroAddress,
} from "viem";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";

import { getNetworkConfig } from "./getNetworkConfig";
import { world } from "./world";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { transportObserver, ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";

import { Subject, share } from "rxjs";

import type {  HappyUser, } from "@happychain/react";
import {  happyProvider, onUserUpdate } from "@happychain/react";
/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";
export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  /*
   * Create a viem public (read only) client
   * (https://viem.sh/docs/clients/public.html)
   */
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(custom(happyProvider)),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  /*
   * Sync on-chain state into RECS and keeps our client in sync.
   * Uses the MUD indexer if available, otherwise falls back
   * to the viem publicClient to make RPC calls to fetch MUD
   * events from the chain.
   */
  const { components, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  let _walletClient: ReturnType<typeof createUserWalletClient> | undefined;
  let _user: HappyUser | undefined;

  function createUserWalletClient(address: `0x${string}`) {
    return createWalletClient({ ...clientOptions, account: address })
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }))
  }


  
  const connectUser = (user: HappyUser) => {
    _user = user
    _walletClient = createUserWalletClient(user.address)
    
    /*
    * If there is a faucet, request (test) ETH if you have
    * less than 1 ETH. Repeat every 20 seconds to ensure you don't
    * run out.
    */
   const { faucetServiceUrl } = networkConfig
    if (faucetServiceUrl) {
      const address = user.address;

      console.info("[Dev Faucet]: Player address -> ", address);

      const requestDrip = async () => {
        const balance = await publicClient.getBalance({ address });
        console.info(`[Dev Faucet]: Player balance -> ${balance}`);
        const lowBalance = balance < parseEther("1");
        if (lowBalance) {
          console.info("[Dev Faucet]: Balance is low, dripping funds to player");
          // Double drip
          await fetch(faucetServiceUrl, {
            method: 'POST',
            body: JSON.stringify({ address })
          })
          await fetch(faucetServiceUrl, {
            method: 'POST',
            body: JSON.stringify({ address })
          })
        }
      };

      requestDrip();
      // Request a drip every 20 seconds
      setInterval(requestDrip, 20000);
    }
  }

  let _playerEntity = encodeEntity({ address: "address" }, { address: zeroAddress })

  onUserUpdate((user?: HappyUser) => {
    if (user) {
      _playerEntity = encodeEntity({ address: "address" }, { address: user.address })
      connectUser(user)
    } else {
      _walletClient = undefined
    }
  })

  const worldContractConfig = { address: networkConfig.worldAddress as Hex, abi: IWorldAbi }
  /*
   * Create an object for communicating with the deployed World.
   */
  const getWorldContract = () => {
    return _walletClient ? getContract({
      ...worldContractConfig,
      client: { public: publicClient, wallet: _walletClient },
    }) : null
  }

  return {
    world,
    components,
    getPlayerEntity: () => _playerEntity,
    publicClient,
    getWalletClient: () => _walletClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    getWorldContract,
    worldContractConfig,
    write$: write$.asObservable().pipe(share()),
  } as const;
}
