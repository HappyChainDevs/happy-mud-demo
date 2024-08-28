import "tailwindcss/tailwind.css";
import "react-toastify/dist/ReactToastify.css";

import { HappyWalletProvider } from "@happychain/react";

import ReactDOM from "react-dom/client";
import createGame from "./mud/gameSetup/createGame";
import GameLoader from "./GameLoader";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const gamePromise = createGame()

root.render(
  <HappyWalletProvider>
    <GameLoader gamePromise={gamePromise} />
  </HappyWalletProvider>
);
