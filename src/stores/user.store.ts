import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nativeStorage } from "zmp-sdk/apis";

export type UserInfo = {
  phone: string;
  name: string;
  avatar: string;
  id?: string;
  email?: string;
  company?: string;
  zalo_user_id?: string;
};

interface UserStoreState {
  user: UserInfo | null;
  /** Whether the phone-auth sheet has been shown at least once for this Zalo user */
  authAsked: boolean;
  setUp: (user: UserInfo) => void;
  setZaloUserId: (zaloUserId: string) => void;
  markAuthAsked: () => void;
  clear: () => void;
}

const storage = {
  getItem: (name: string) => nativeStorage.getItem(name) ?? null,
  setItem: (name: string, value: string) => {
    nativeStorage.setItem(name, value);
  },
  removeItem: (name: string) => nativeStorage.removeItem(name),
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      user: null,
      authAsked: false,
      setUp: (user) => set({ user }),
      setZaloUserId: (zaloUserId) =>
        set((state) => ({
          user: state.user ? { ...state.user, zalo_user_id: zaloUserId } : null,
        })),
      markAuthAsked: () => set({ authAsked: true }),
      clear: () => set({ user: null, authAsked: false }),
    }),
    {
      name: "zmp-event-user",
      storage,
    },
  ),
);

export const getUserPhone = () => useUserStore.getState().user?.phone ?? "";