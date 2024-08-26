import { useHappyChain } from "@happychain/react";
import { StrictMode, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import GameWrapper from "./GameWrapper";
import { MUDProvider } from "./MUDContext";
import { initializeDevTools } from "./devtools";
import { type SetupResult, setup } from "./mud/setup";

function GameScreen({ setupVal }: { setupVal: SetupResult }) {
  return (
    <>
      <MUDProvider value={setupVal}>
        <StrictMode>
          <GameWrapper />
          <ToastContainer
            position="bottom-right"
            draggable={false}
            theme="dark"
          />
        </StrictMode>
      </MUDProvider>
    </>
  );
}

export function App() {
  const { user, provider } = useHappyChain();
  const [setupVal, setSetupVal] = useState<SetupResult | null>(null);

  useEffect(() => {
    void (async () => {
      const setupResult = await setup(provider, user);
      setSetupVal(setupResult);
      if (import.meta.env.DEV) {
        await initializeDevTools(setupResult);
      }
    })();
  }, [provider, user]);

  return setupVal && <GameScreen setupVal={setupVal} />;
}
