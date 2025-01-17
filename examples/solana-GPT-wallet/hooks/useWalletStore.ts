import { create } from 'zustand';

interface WalletStore {
    balance: number;
    solPrice: number;
    totalWalletBalance: number;
    setBalance: (balance: number) => void;
    setTotalWalletBalance: (totalWalletBalance: number) => void;
    setSolPrice: (totalWalletBalance: number) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
    balance: 0,
    totalWalletBalance: 0,
    solPrice: 0,
    setBalance: (balance) => set({ balance }),
    setTotalWalletBalance: (totalWalletBalance) => set({ totalWalletBalance }),
    setSolPrice: (solPrice) => set({ solPrice })
}))