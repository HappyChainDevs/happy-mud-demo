import { requestSessionKey } from "@happy.tech/core"
import { useHappyChain } from "@happy.tech/react"
import { useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"
import { type Address, custom } from "viem"
import { ConnectButton } from "./ConnectButton"
import { LoadingWrapper } from "./LoadingWrapper"
import { MUDProvider } from "./MUDContext"
import { createEmojimonWalletClient } from "./mud/account"
import { useDevTools } from "./mud/devTools"
import { useFaucet } from "./mud/faucet"
import { networkConfig } from "./mud/networkConfig"
import { useSetup } from "./mud/setup"
import type { WalletClientWithAccount } from "./mud/types"

export const App = () => {
    const [wallet, setWallet] = useState<WalletClientWithAccount | undefined>()
    const { user, provider } = useHappyChain()
    const mud = useSetup(wallet)
    useFaucet(wallet?.account.address)
    useDevTools(mud)

    useEffect(() => {
        if (!provider) return
        if (!user) {
            setWallet(undefined)
            return
        }
        if (!wallet) {
            void requestSessionKey(networkConfig.worldAddress as Address)
            setWallet(createEmojimonWalletClient(user.address, custom(provider)))
        }
    }, [user, provider, wallet])

    return mud ? (
        <MUDProvider value={mud}>
            <div className="absolute top-0 right-0 p-5">
                <ConnectButton disableStyles={false} />
            </div>
            <LoadingWrapper />
            <ToastContainer position="bottom-right" draggable={false} theme="dark" />
        </MUDProvider>
    ) : (
        <div className="w-screen h-screen flex items-center justify-center">
            <div>Setting up ...</div>
        </div>
    )
}
