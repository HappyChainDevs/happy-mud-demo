import { createContext, ReactNode, useContext, useRef } from "react"
import { HappyEmojimonValue, useHappyChainValue } from "./happyChain";

const MUDContext = createContext<HappyEmojimonValue | null>(null);

type Props = {
  children: ReactNode;
  value: HappyEmojimonValue;
};

export const MUDProvider = ({ children, value }: Props) => {
  const parentValue = useContext(MUDContext);
  if (parentValue) throw new Error("MUDProvider can only be used once");

  // Save previous value to avoid re-computing when not necessary.
  const currentValue = useRef(value);
  currentValue.current = useHappyChainValue(currentValue.current);

  console.log("user", currentValue.current.network.walletClient?.account?.address);
  console.log("MUDProvider", currentValue.current);

  return <MUDContext.Provider value={currentValue.current}>{children}</MUDContext.Provider>;
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
