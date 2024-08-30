import { Network } from "./createNetwork";
import { createWorld, defineComponentSystem } from "@latticexyz/recs";
import { SyncStep } from "@latticexyz/store-sync";
import { deferred } from "@latticexyz/utils";

/**
 * Function to create a promise that resolves when the initial synchronization is complete.
 * 
 * This function takes a `Network` object and sets up a system to monitor the synchronization
 * progress of the network. When the network reaches the `LIVE` synchronization step,
 * the promise is resolved, indicating that the initial synchronization is complete.
 *
 * @param {Network} network - The network object that contains components and handles synchronization.
 * 
 * @returns {Promise<void>} - A promise that resolves once the initial synchronization is complete.
 */
const getInitialSyncCompletePromise = async (network: Network): Promise<void> => {
  const {
    components: { SyncProgress },
  } = network;
  const promiseWorld = createWorld();
  const [resolve, , promise] = deferred();
  defineComponentSystem(promiseWorld, SyncProgress, (update) => {
    if (update.value[0]?.step === SyncStep.LIVE) {
      promiseWorld.dispose();
      resolve(undefined);
    }
  });
  console.log("[Initial Sync] Awaiting initial sync");
  await promise;
  console.log("[Initial Sync] Initial sync complete");
};

export default getInitialSyncCompletePromise;
