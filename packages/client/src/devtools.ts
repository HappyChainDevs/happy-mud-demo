import mudConfig from "contracts/mud.config";
import type { SetupResult } from "./mud/setup";

export async function initializeDevTools(setupResult: SetupResult) {
  const walletClient = setupResult.network.getWalletClient()
  if (!walletClient) {
    return;
  }
  return (await import("@latticexyz/dev-tools")).mount({
    config: mudConfig,
    publicClient: setupResult.network.publicClient,
    walletClient: walletClient,
    latestBlock$: setupResult.network.latestBlock$,
    storedBlockLogs$: setupResult.network.storedBlockLogs$,
    worldAddress: setupResult.network.worldContractConfig.address,
    worldAbi: setupResult.network.worldContractConfig.abi,
    write$: setupResult.network.write$,
    recsWorld: setupResult.network.world,
  });
}
