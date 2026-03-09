"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type FinanceAccessMode = "admin" | "visitor";

type FinanceAccessState = {
  mode: FinanceAccessMode | null;
  setMode: (mode: FinanceAccessMode) => void;
};

const FinanceAccessContext = createContext<FinanceAccessState | null>(null);

export function FinanceAccessProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [mode, setModeState] = useState<FinanceAccessMode | null>(null);

  const setMode = (value: FinanceAccessMode) => {
    setModeState(value);
  };

  return (
    <FinanceAccessContext.Provider value={{ mode, setMode }}>
      {children}
    </FinanceAccessContext.Provider>
  );
}

export function useFinanceAccess(): FinanceAccessState {
  const ctx = useContext(FinanceAccessContext);
  if (!ctx) {
    // Fallback seguro: trata tudo como admin se o provider não estiver presente.
    return {
      mode: "admin",
      setMode: () => {},
    };
  }
  return ctx;
}

