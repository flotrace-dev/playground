import { create } from "zustand";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  user: User | null;
  profile: User | null;
  setUser: (u: User) => void;
  setProfile: (u: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  setUser: (u) => set({ user: u }),
  setProfile: (u) => set({ profile: u }),
}));
