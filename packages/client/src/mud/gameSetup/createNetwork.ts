import { createWorld } from "@latticexyz/recs";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Address, Hex, PublicClient, WalletClient, getContract } from "viem";
import { NetworkConfig } from "../getNetworkConfig";

export type Network = Awaited<ReturnType<typeof createNetwork>>;

export const createNetwork = async (
  networkConfig: NetworkConfig,
  publicClient: PublicClient
) => {
  const world = createWorld();

  console.log(
    "[Create Network] Creating network with networkConfig",
    networkConfig
  );

  const result = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  // getter function for World contract instantiated with wallet client
  const getWalletClientContract = async (walletClient: WalletClient) => {
    return getContract({
      abi: IWorldAbi,
      address: networkConfig.worldAddress as `0x${string}`,
      client: { public: publicClient, wallet: walletClient },
    });
  };

  // eslint-disable-next-line
  (window as any).network = result;

  return {
    world: createWorld(),
    networkConfig,
    ...result,
    worldAddress: networkConfig.worldAddress as Address,
    worldContract: getContract({
      address: networkConfig.worldAddress as Address,
      abi: IWorldAbi,
      client: publicClient,
    }),
    publicClient,
    getWalletClientContract,
  };
};

export default createNetwork;
