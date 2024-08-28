import { useEffect } from "react";
import { useMUD } from "./MUDContext";
import { Direction } from "./direction";

export const useKeyboardMovement = () => {
  const { getApi } = useMUD();

  const api = getApi();

  useEffect(() => {
    const listener = async (e: KeyboardEvent) => {
      if (!api) return;
      if (e.key === "ArrowUp") {
        await api.move(Direction.North);
      }
      if (e.key === "ArrowDown") {
        await api.move(Direction.South);
      }
      if (e.key === "ArrowLeft") {
        await api.move(Direction.West);
      }
      if (e.key === "ArrowRight") {
        await api.move(Direction.East);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [api]);
};
