import {
  fallback,
  ClientConfig,
  http,
  createPublicClient,
  WalletClient,
} from "viem";
import { getNetworkConfig } from "../getNetworkConfig";
import { Api, createApi } from "./createApi";
import createNetwork, { Network } from "./createNetwork";
import getInitialSyncCompletePromise from "./getInitialSyncCompletePromise";
import { createWorld } from "@latticexyz/recs";
import { createGameComponents } from "./createGameComponents";

export type Game = Awaited<ReturnType<typeof createGame>>;

const createGame = async () => {
  let api: Api | undefined;
  let network: Network | undefined;

  const networkConfig = await getNetworkConfig();

  const clientOptions = {
    chain: networkConfig.chain,
    transport: fallback([http()]),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const setupComponents = async () => {
    // setup game components here, cf: `src/mud/createClientComponents.ts`
    const gameWorld = createWorld();
    network = await createNetwork(networkConfig, publicClient);

    const gameComponents = createGameComponents(network);

    return { gameWorld, gameComponents };
  };

  const { gameWorld, gameComponents } = await setupComponents();

  /**
   * Used in MUDProvider to track when user connects
   * using the HC react SDK. once `user` is populated, the WalletClient
   * is instantiated there and passed in here, to then create the MUD
   * system calls.
   */
  const connectPlayer = async (walletClient: WalletClient) => {
    if (!walletClient.account) {
      console.error("[Game] not connecting player with undefined account");
      return;
    }

    api = await createApi(gameComponents, walletClient, network);
    console.log("[Game] API Created:", { api });

    return api;
  };

  const getGameLoadPromise = async () => {
    if (!network) {
      throw new Error("[Game] Network not defined");
    }
    return await getInitialSyncCompletePromise(network);
  };

  const game = {
    publicClient,
    gameWorld,
    gameComponents,
    connectPlayer,
    getGameLoadPromise,
  };

  return game;
};

export default createGame;
