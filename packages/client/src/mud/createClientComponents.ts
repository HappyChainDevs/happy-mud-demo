import { overridableComponent } from "@latticexyz/recs";
import { SetupNetworkResult } from "./setupNetwork";
import { SetupRawNetworkResult } from "./setupRawNetwork";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({ components }: SetupNetworkResult | SetupRawNetworkResult) {
  return {
    ...components,
    Player: overridableComponent(components.Player),
    Position: overridableComponent(components.Position),
  };
}
