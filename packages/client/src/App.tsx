import { useEffect, useState } from "react"
import { ToastContainer } from "react-toastify";
import { useHappyChain } from "@happychain/react";
import { custom } from "viem";
import { LoadingWrapper } from "./LoadingWrapper";
import { createEmojimonWalletClient } from "./mud/account";
import { useDevTools } from "./mud/devTools";
import { useFaucet } from "./mud/faucet";
import { useSetup } from "./mud/setup";
import { WalletClientWithAccount } from "./mud/types";
import { MUDProvider } from "./MUDContext";

function happyConnectStub() {}
function happyDisconnectStub() {}

export const App = () => {
  const [wallet, setWallet] = useState<WalletClientWithAccount | undefined>();
  const { user, provider } = useHappyChain();
  const mud = useSetup(wallet);
  useFaucet(wallet?.account.address);
  useDevTools(mud);

  useEffect(() => {
    if (!user || !provider) return;
    setWallet(createEmojimonWalletClient(user.address, custom(provider)));
  }, [user, provider]);

  return mud
    ? <MUDProvider value={mud}>
        <div style={{ position: "absolute", top: "0", right: "0", padding: "20px" }}>
          {!wallet
            ? <button onClick={happyConnectStub} style={{ cursor: "pointer" }}>Connect</button>
            : <button onClick={happyDisconnectStub} style={{ cursor: "pointer" }}>Disconnect</button>}
        </div>
        <LoadingWrapper/>;
        <ToastContainer position="bottom-right" draggable={false} theme="dark"/>
      </MUDProvider>
    : <div className="w-screen h-screen flex items-center justify-center">
        <div>Setting up ...</div>
      </div>
};
