/*
 * This file sets up all the definitions required for a MUD client.
 */

import type { HappyProvider, HappyUser } from "@happychain/react";
import { createClientComponents } from "./createClientComponents";
import { createSystemCalls } from "./createSystemCalls";
import { setupNetwork } from "./setupNetwork";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup(user: HappyUser, provider: HappyProvider) {
  const network = await setupNetwork(user, provider);
  const components = createClientComponents(network);
  const systemCalls = createSystemCalls(network, components);

  return {
    network,
    components,
    systemCalls,
  };
}
