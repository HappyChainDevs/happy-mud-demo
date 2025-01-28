import { happyProvider } from "@happychain/js"
import { type ContractWrite, createBurnerAccount, transportObserver } from "@latticexyz/common"
import { transactionQueue, writeObserver } from "@latticexyz/common/actions"
import { Subject } from "rxjs"
import {
    type Account,
    type Address,
    type ClientConfig,
    type Hex,
    type Transport,
    createPublicClient,
    createWalletClient,
} from "viem"
import { custom } from "viem"
import { networkConfig } from "./networkConfig"

const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(custom(happyProvider)),
    // transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
} as const satisfies ClientConfig

/*
 * Create a viem public (read only) client
 * (https://viem.sh/docs/clients/public.html)
 */
export const publicClient = createPublicClient(clientOptions)

/*
 * Create an observable for contract writes that we can
 * pass into MUD dev tools for transaction observability.
 */
export const write$ = new Subject<ContractWrite>()

export function createEmojimonWalletClient(account: Account | Address, transport?: Transport) {
    return createWalletClient({
        ...clientOptions,
        transport: transport ?? clientOptions.transport,
        account,
    })
        .extend(transactionQueue())
        .extend(writeObserver({ onWrite: (write) => write$.next(write) }))
}

export function createBurnerWalletClient() {
    const burnerAccount = createBurnerAccount(networkConfig.burnerPrivateKey as Hex)
    return createEmojimonWalletClient(burnerAccount)
}
