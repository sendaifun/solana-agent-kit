// src/utils/balance-utils.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export const validateBalance = (
    amount: number,
    balance: number,
    token: 'SOL' | 'USDC' = 'SOL'
): { isValid: boolean; error?: string } => {
    if (amount <= 0) {
        return {
            isValid: false,
            error: `Amount must be greater than 0 ${token}`
        };
    }

    if (amount > balance) {
        return {
            isValid: false,
            error: `Insufficient ${token} balance. You have ${balance.toFixed(token === 'SOL' ? 4 : 2)} ${token}`
        };
    }

    if (token === 'SOL') {
        if (amount < 0.000001) {
            return {
                isValid: false,
                error: 'Minimum transaction amount is 0.000001 SOL'
            };
        }

        if (amount > balance - 0.001) {
            return {
                isValid: false,
                error: 'Please leave at least 0.001 SOL for transaction fees'
            };
        }
    }

    return { isValid: true };
};

export const fetchSOLBalance = async (
    connection: Connection,
    publicKey: PublicKey
): Promise<number> => {
    try {
        const balance = await connection.getBalance(publicKey, 'confirmed');
        return balance / LAMPORTS_PER_SOL;
    } catch (error) {
        console.error('Error fetching SOL balance:', error);
        throw new Error('Failed to fetch SOL balance');
    }
};

export const fetchUSDCBalance = async (
    connection: Connection,
    publicKey: PublicKey
): Promise<number> => {
    try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: USDC_MINT,
        });

        if (tokenAccounts.value.length === 0) return 0;

        const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        return balance || 0;
    } catch (error) {
        console.error('Error fetching USDC balance:', error);
        return 0; // Return 0 instead of throwing for USDC
    }
};

export const updateAllBalances = async (
    connection: Connection,
    publicKey: PublicKey,
    setBalance: (sol: number) => void,
    setUsdcBalance: (usdc: number) => void
) => {
    try {
        const [solBalance, usdcBalance] = await Promise.all([
            fetchSOLBalance(connection, publicKey),
            fetchUSDCBalance(connection, publicKey)
        ]);

        setBalance(solBalance);
        setUsdcBalance(usdcBalance);
        return true;
    } catch (error) {
        console.error('Error updating balances:', error);
        return false;
    }
};