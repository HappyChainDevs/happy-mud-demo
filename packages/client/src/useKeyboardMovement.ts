import { useEffect } from "react";
import { useMUD } from "./MUDContext";
import { Direction } from "./direction";

export const useKeyboardMovement = () => {
  const { createdApi } = useMUD();

  useEffect(() => {
    const listener = async (e: KeyboardEvent) => {
      if (!createdApi) return;
      if (e.key === "ArrowUp") {
        await createdApi.move(Direction.North);
      }
      if (e.key === "ArrowDown") {
        await createdApi.move(Direction.South);
      }
      if (e.key === "ArrowLeft") {
        await createdApi.move(Direction.West);
      }
      if (e.key === "ArrowRight") {
        await createdApi.move(Direction.East);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [createdApi]);
};
