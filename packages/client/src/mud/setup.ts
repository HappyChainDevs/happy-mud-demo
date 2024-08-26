/*
 * This file sets up all the definitions required for a MUD client.
 */

import type { HappyProvider, HappyUser } from "@happychain/react";
import { createClientComponents } from "./createClientComponents";
import { createSystemCalls } from "./createSystemCalls";
import { setupNetwork } from "./setupNetwork";
import { setupRawNetwork } from "./setupRawNetwork";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup(provider: HappyProvider, user?: HappyUser) {
  // doctor out the walletClient
  const network = user 
    ? await setupNetwork(user, provider)
    : await setupRawNetwork();
  const components = createClientComponents(network);
  const systemCalls = createSystemCalls(network, components);

  return {
    network,
    components,
    systemCalls,
  };
}
