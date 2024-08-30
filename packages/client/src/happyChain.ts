import { transportObserver } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { Entity } from "@latticexyz/recs";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json"
import { useEffect, useRef } from "react";
import {
  Account,
  Address, Chain,
  createWalletClient,
  custom,
  getContract,
  Hex,
  parseEther,
  PublicClient, Transport, WalletClient,
} from "viem"
import { getNetworkConfig } from "./mud/getNetworkConfig";
import { setup } from './mud/setup';
import { useHappyChain } from "@happychain/react";
import { createFaucetService } from "@latticexyz/services/faucet";
import { createSystemCalls } from "./mud/createSystemCalls";

export type HappyChainNetworkOverride = {
  playerEntity?: Entity
  walletClient?: WalletClientWithAccount
  worldContract: ReturnType<typeof getWriteWorldContract>
};

export type EmojimonValue = Awaited<ReturnType<typeof setup>>;
export type HappyEmojimonValue = EmojimonValue & { network: HappyChainNetworkOverride };

type WalletClientWithAccount = WalletClient<Transport, Chain, Account>;
type EmojimonNetworkConfig = ReturnType<typeof getNetworkConfig>;
type Destructor = () => void;

const noop: Destructor = () => {};
const noopPromise = Promise.resolve(noop);

/**
 * Configures the Emojimon MUD value depending on the user (logged in? address?).
 */
export function useHappyChainValue(_value: EmojimonValue): HappyEmojimonValue {
  const value: HappyEmojimonValue = _value as HappyEmojimonValue; // TODO cheat on the worldContract
  const { user, provider } = useHappyChain();
  const oldAddress = user?.address;
  const currentAddress = value.network.walletClient?.account.address;
  const networkConfig = getNetworkConfig();

  const unmountDevtoolsPromise = useRef(noopPromise);

  useEffect(() => {
    unmountDevtoolsPromise.current.then(async (unmount) => {
      unmount()
      unmountDevtoolsPromise.current = mountDevTools(value);
    })

    const stopFaucet = runFaucetService(currentAddress, value, networkConfig);

    return () => {
      unmountDevtoolsPromise.current.then(async (unmount) => {
        unmount()
        unmountDevtoolsPromise.current = noopPromise;
      });
      stopFaucet();
    }
  }, [value, networkConfig, currentAddress]);

  // Re-render for the same user, no need to change the current value.
  if (oldAddress === currentAddress)
    return value;

  // No user when there was one before, logoff.
  if (!user) {
    const network = {
      ...value.network,
      playerEntity: undefined,
      walletClient: undefined,
    }
    const systemCalls = createSystemCalls(network, value.components);
    return { ...value, network, systemCalls };
  }

  // Logging in or switching user, change the address and create the wallet client.

  const walletClient = createWalletClient({
    chain: networkConfig.chain,
    transport: transportObserver(custom(provider)),
    pollingInterval: 1000,
    account: user.address,
  })
    .extend(transactionQueue())
    .extend(writeObserver({onWrite: (write) => value.network.writeSubject.next(write)}));

  const worldContract = getWriteWorldContract(
    networkConfig, value.network.publicClient, walletClient);

  const playerEntity = encodeEntity({ address: "address" }, { address: user.address });
  const network = { ...value.network, playerEntity, walletClient, worldContract };
  const systemCalls = createSystemCalls(network, value.components);
  return { ...value, network, systemCalls };
}

/**
 * Returns a world contract (read/write to MUD world) plugged in with the wallet client.
 * Isolate this function so that we may use its complex Viem-computed return value for typing.
 */
function getWriteWorldContract(
  networkConfig: EmojimonNetworkConfig,
  publicClient: PublicClient,
  walletClient: WalletClientWithAccount
) {
  return getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    // Update with the wallet client.
    client: { public: publicClient, wallet: walletClient },
  });
}

/**
 * Mounts the dev tools in development mode.
 */
async function mountDevTools(value: HappyEmojimonValue): Promise<Destructor> {
  if (import.meta.env.DEV) return noop;

  // Avoid loading when not in dev mode.
  const { mount } = await import("@latticexyz/dev-tools");

  return await mount({
    config: mudConfig,
    publicClient: value.network.publicClient,
    walletClient: value.network.walletClient!, // this will work even if undefined
    latestBlock$: value.network.latestBlock$,
    storedBlockLogs$: value.network.storedBlockLogs$,
    worldAddress: value.network.worldContract.address,
    worldAbi: value.network.worldContract.abi,
    write$: value.network.write$,
    recsWorld: value.network.world,
  }) ?? noop;
}

/**
 * Runs the faucet service if the player is logged in.
 */
function runFaucetService(
  address: Address | undefined,
  value: EmojimonValue,
  networkConfig: EmojimonNetworkConfig
): Destructor {
  if (!address || !networkConfig.faucetServiceUrl)
    return noop;

  /*
   * If there is a faucet, request (test) ETH if you have
   * less than 1 ETH. Repeat every 20 seconds to ensure you don't
   * run out.
   */
  console.info("[Dev Faucet]: Player address -> ", address);
  const faucet = createFaucetService(networkConfig.faucetServiceUrl);

  const requestDrip = async () => {
    const balance = await value.network.publicClient.getBalance({ address });
    console.info(`[Dev Faucet]: Player balance -> ${balance}`);
    const lowBalance = balance < parseEther("1");
    if (lowBalance) {
      console.info("[Dev Faucet]: Balance is low, dripping funds to player");
      // Double drip
      await faucet.dripDev({ address });
      await faucet.dripDev({ address });
    }
  };

  // Request a drip now then every 20 seconds
  void requestDrip();
  const interval = setInterval(requestDrip, 20000);

  return () => clearInterval(interval);
}