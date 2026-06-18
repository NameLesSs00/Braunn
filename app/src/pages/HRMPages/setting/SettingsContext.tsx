import { createContext, useContext } from 'react';

type SettingsContextType = {
  onAddClick: () => void;
  addTrigger: number;
  activeAction: string | null;
  setActiveAction: (action: string | null) => void;
};

export const SettingsContext = createContext<SettingsContextType>({
  onAddClick: () => {},
  addTrigger: 0,
  activeAction: null,
  setActiveAction: () => {},
});

export function useSettingsContext() {
  return useContext(SettingsContext);
}
