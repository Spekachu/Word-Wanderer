import { useContext } from 'react';
import { WordProvider } from '../contexts/AppContext';
import { AuthProvider } from '../contexts/AuthContext';

export const useAppAuth = () => {
  const appContext = useContext(WordProvider);
  const authContext = useContext(AuthProvider);

  return { ...appContext, ...authContext };
};