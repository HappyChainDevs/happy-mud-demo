import { useEffect } from "react"
import { useMUD } from "./MUDContext"
import { Direction } from "./direction"

export const useKeyboardMovement = () => {
    const {
        systemCalls: { move } = {},
    } = useMUD()

    useEffect(() => {
        if (!move) return

        const listener = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
                move(Direction.North)
            }
            if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
                move(Direction.West)
            }
            if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
                move(Direction.South)
            }
            if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
                move(Direction.East)
            }
        }

        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, [move])
}
