import { ToastContainer } from "react-toastify";
import { MUDProvider } from "./MUDContext";
import { Game } from "./mud/gameSetup/createGame";
import { GameBoard } from "./GameBoard";

export function App({ game }: { game: Game }) {
  return (
    <div>
      <MUDProvider game={game}>
        <div className="w-screen h-screen flex items-center justify-center">
          <GameBoard />
        </div>

        <ToastContainer
          position="bottom-right"
          draggable={false}
          theme="dark"
        />
      </MUDProvider>
    </div>
  );
}
