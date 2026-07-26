import { createContext, useContext } from 'react';
import type { IColorMode } from '../types/theme'

export const Context = createContext<IColorMode>({ toggleColorMode: () => { } });

export const useColorMode = () => {
  return useContext(Context);
};
