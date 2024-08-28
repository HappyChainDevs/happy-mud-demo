import React, { useEffect, useState } from "react";
import { Game } from "./mud/gameSetup/createGame";
import { App } from "./App";

const GameLoader = ({ gamePromise }: { gamePromise: Promise<Game> }) => {
  const [game, setGame] = useState<Game | undefined>(undefined);

  useEffect(() => {
    gamePromise.then((game) => {
      game.getGameLoadPromise().then(() => {
        setGame(game);
      });
    });
  }, [gamePromise]);

  return (
    <>
      {/* <LoadingOverlay gameLoaded={!!game} /> */}
      {game && <App game={game} />}
    </>
  );
};

export default GameLoader;
