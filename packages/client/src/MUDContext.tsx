import { transportObserver } from "@latticexyz/common"
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createContext, ReactNode, useContext } from "react";
import {
  Account,
  Chain,
  createWalletClient,
  custom,
  getContract,
  Hex,
  Transport,
  WalletClient,
} from "viem"
import { GetContractReturnType } from "viem/_types/actions/getContract"
import { getNetworkConfig } from "./mud/getNetworkConfig"
import { SetupResult } from "./mud/setup";
import { useHappyChain } from "@happychain/react";

const MUDContext = createContext<SetupResult | null>(null);

type Props = {
  children: ReactNode;
  value: SetupResult;
};

export type WalletClientWithAccount = WalletClient<Transport, Chain, Account>;

export type HappyChainState = {
  walletClient: WalletClientWithAccount | undefined;
  worldContractWrite: GetContractReturnType<typeof IWorldAbi, WalletClientWithAccount> | undefined;
}

export const happyChainState: HappyChainState = {
  walletClient: undefined,
  worldContractWrite: undefined,
}

export const MUDProvider = ({ children, value }: Props) => {
  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("MUDProvider can only be used once");

  const { user, provider } = useHappyChain();
  if (user) {
    const networkConfig = getNetworkConfig();
    if (!happyChainState.walletClient || happyChainState.walletClient?.account?.address !== user.address) {
      happyChainState.walletClient = createWalletClient({
        chain: networkConfig.chain,
        transport: transportObserver(custom(provider)),
        pollingInterval: 1000,
        account: user.address,
      })
        .extend(transactionQueue())
        .extend(writeObserver({onWrite: (write) => value.network.writeSubject.next(write)}));

      happyChainState.worldContractWrite = getContract({
        address: value.network.worldContract.address as Hex,
        abi: IWorldAbi,
        client: { public: value.network.publicClient, wallet: happyChainState.walletClient },
      });
    }
  }

  return <MUDContext.Provider value={value}>{children}</MUDContext.Provider>;
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
