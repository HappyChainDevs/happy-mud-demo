import { useHappyChain, happyProvider } from "@happychain/react";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import GameWrapper from "./GameWrapper";
import { MUDProvider } from "./MUDContext";
import { initializeDevTools } from "./devtools";
import { type SetupResult, setup } from "./mud/setup";

function GameScreen({ setupVal }: { setupVal: SetupResult }) {
  return (
    <>
      <MUDProvider value={setupVal}>
        <GameWrapper />
        <ToastContainer
          position="bottom-right"
          draggable={false}
          theme="dark"
        />
      </MUDProvider>
    </>
  );
}

export function App() {
  const { user } = useHappyChain();
  const [setupVal, setSetupVal] = useState<SetupResult | null>(null);

  useEffect(() => {
    void (async () => {
      const setupResult = await setup();
      setSetupVal(setupResult);
    })();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (import.meta.env.DEV && setupVal && user) {
        // dev tools seems to require walletClient so we can't instantiate
        // until user has signed in
        await initializeDevTools(setupVal);
      }
    };
    init();
  }, [user, setupVal]);

  return setupVal && <GameScreen setupVal={setupVal} />;
}
