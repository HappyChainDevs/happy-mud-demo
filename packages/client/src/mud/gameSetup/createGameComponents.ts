import { overridableComponent } from "@latticexyz/recs";
import { Network } from "./createNetwork";
 

export type OverridableGameComponents = ReturnType<typeof createGameComponents>;

export function createGameComponents({ components }: Network) {
  return {
    ...components,
    Player: overridableComponent(components.Player),
    Position: overridableComponent(components.Position),
  };
}
