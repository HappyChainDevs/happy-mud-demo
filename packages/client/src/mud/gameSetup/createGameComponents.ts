import { overridableComponent } from "@latticexyz/recs";
import { Network } from "./createNetwork";
 
// cf: https://mud.dev/guides/emojimon/3-players-and-movement#optimistic-rendering
export type OverridableGameComponents = ReturnType<typeof createGameComponents>;

export function createGameComponents({ components }: Network) {
  return {
    ...components,
    Player: overridableComponent(components.Player),
    Position: overridableComponent(components.Position),
  };
}
