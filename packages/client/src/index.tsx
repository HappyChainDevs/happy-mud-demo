import "tailwindcss/tailwind.css"
import "react-toastify/dist/ReactToastify.css"

import { HappyWalletProvider } from "@happychain/react"
import ReactDOM from "react-dom/client"
import { App } from "./App"

const rootElement = document.getElementById("react-root")
if (!rootElement) throw new Error("React root not found")
const root = ReactDOM.createRoot(rootElement)
root.render(
    <HappyWalletProvider>
        <App />
    </HappyWalletProvider>,
)
