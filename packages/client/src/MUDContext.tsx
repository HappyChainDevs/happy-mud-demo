import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { HappyUser } from "../../../../happychain/packages/sdk-shared/lib";
import { useHappyChain } from "@happychain/react";
import { Game } from "./mud/gameSetup/createGame";
import { ContractWrite, transportObserver } from "@latticexyz/common";
import { ClientConfig, createWalletClient, custom } from "viem";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { Subject } from "rxjs";
import { Api } from "./mud/gameSetup/createApi";
import { getNetworkConfig } from "./mud/getNetworkConfig";

type MUDContextType = {
  game: Game;
  createdApi?: Api;
};

const MUDContext = createContext<MUDContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
  game: Game;
};

export const MUDProvider = ({ children, game }: Props) => {
  const [createdApi, setCreatedApi] = useState<Api | undefined>(undefined);
  const { user, provider } = useHappyChain();

  const processUserUpdate = async (gameSetup: Game, user: HappyUser) => {
    /*
     * Create an observable for contract writes that we can
     * pass into MUD dev tools for transaction observability.
     */
    const write$ = new Subject<ContractWrite>();
    const networkConfig = await getNetworkConfig();

    /*
     * Create a viem public (read only) client
     * (https://viem.sh/docs/clients/public.html)
     */
    const clientOptions = {
      chain: networkConfig.chain,
      transport: transportObserver(custom(provider)),
      pollingInterval: 1000,
    } as const satisfies ClientConfig;

    const walletClient = createWalletClient({
      ...clientOptions,
      account: user.address,
    })
      .extend(transactionQueue())
      .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

    const api = await game.connectPlayer(walletClient);
    if (api) setCreatedApi(api);
  };

  /** instead of running setup again
   * push in the wallet client and instantiate world contract
   */
  useEffect(() => {
    if (user) processUserUpdate(game, user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, user]);

  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("MUDProvider can only be used once");
  return (
    <MUDContext.Provider value={{ game, createdApi }}>
      {children}
    </MUDContext.Provider>
  );
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
