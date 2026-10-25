import { create } from 'zustand';
import type { CurrentUserResponse } from '../types/auth';

interface AuthState {
  user: CurrentUserResponse | null;
  isLoggedIn: boolean;
  setCurrentUser: (user: CurrentUserResponse | null) => void;
}

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoggedIn: false,

  setCurrentUser: (user) =>
    set({
      user,
      isLoggedIn: user !== null,
    }),
}));

export default useAuthStore;