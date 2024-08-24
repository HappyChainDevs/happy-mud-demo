import mudConfig from "contracts/mud.config";
import type { SetupResult } from "./mud/setup";

export async function initializeDevTools(setupResult: SetupResult) {
  return (await import("@latticexyz/dev-tools")).mount({
    config: mudConfig,
    publicClient: setupResult.network.publicClient,
    walletClient: setupResult.network.walletClient,
    latestBlock$: setupResult.network.latestBlock$,
    storedBlockLogs$: setupResult.network.storedBlockLogs$,
    worldAddress: setupResult.network.worldContract.address,
    worldAbi: setupResult.network.worldContract.abi,
    write$: setupResult.network.write$,
    recsWorld: setupResult.network.world,
  });
}