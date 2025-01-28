import type { Account, Chain, Transport, WalletClient } from "viem"
import type { ClientComponents } from "./createClientComponents"
import type { SystemCalls } from "./createSystemCalls"
import type { Network } from "./setupNetwork"

/**
 * Type for cleanups, unsubscribes, ...
 */
export type Destructor = () => void

/**
 * No-arg function that does nothing, good for default destructor values.
 */
export const noop = () => {}

/**
 * Type of a wallet client that has its account set.
 */
export type WalletClientWithAccount = WalletClient<Transport, Chain, Account>

/**
 * This is the type of the value returned by useMUD().
 */
export type MUDInterface = {
    network: Network
    components: ClientComponents
    systemCalls?: SystemCalls
}
