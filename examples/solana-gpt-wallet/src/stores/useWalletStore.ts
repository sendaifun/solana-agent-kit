import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';

interface WalletStore {
    balance: number;
    publicKey: PublicKey | null;
    isConnected: boolean;
    isLoading: boolean;
    lastTransaction: string | null;
    error: string | null;
    setBalance: (balance: number) => void;
    setPublicKey: (publicKey: PublicKey | null) => void;
    setIsConnected: (isConnected: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    setLastTransaction: (txId: string | null) => void;
    setError: (error: string | null) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
    balance: 0,
    publicKey: null,
    isConnected: false,
    isLoading: false,
    lastTransaction: null,
    error: null,
    setBalance: (balance) => set({ balance }),
    setPublicKey: (publicKey) => set({ publicKey }),
    setIsConnected: (isConnected) => set({ isConnected }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setLastTransaction: (txId) => set({ lastTransaction: txId }),
    setError: (error) => set({ error }),
}));