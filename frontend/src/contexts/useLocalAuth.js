import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useLocalAuth = () => useContext(AuthContext);
