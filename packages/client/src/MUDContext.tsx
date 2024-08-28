import { createContext, ReactNode, useContext, useEffect } from "react";
import { HappyUser } from "../../../../happychain/packages/sdk-shared/lib";
import { useHappyChain } from "@happychain/react";
import { Game } from "./mud/gameSetup/createGame";
import { ContractWrite, transportObserver } from "@latticexyz/common";
import { ClientConfig, createWalletClient, custom } from "viem";
import { localhost } from "viem/chains";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { Subject } from "rxjs";

const MUDContext = createContext<Game | undefined>(undefined);

type Props = {
  children: ReactNode;
  game: Game;
};

export const MUDProvider = ({ children, game }: Props) => {
  const { user, provider } = useHappyChain();

  const processUserUpdate = async (gameSetup: Game, user: HappyUser) => {
    // instantiate wallet client here
    const write$ = new Subject<ContractWrite>();
    
    const clientOptions = {
      chain: localhost,
      transport: transportObserver(custom(provider)),
      pollingInterval: 1000,
    } as const satisfies ClientConfig;

    const walletClient = createWalletClient({
      ...clientOptions,
      account: user.address,
    })
      .extend(transactionQueue())
      .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

    game.connectPlayer(walletClient);
  };

  useEffect(() => {
    // instead of running setup again, push in the wallet client and instantiate world contract
    if (user) processUserUpdate(game, user);
  }, [game, user]);

  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("MUDProvider can only be used once");
  return <MUDContext.Provider value={game}>{children}</MUDContext.Provider>;
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
