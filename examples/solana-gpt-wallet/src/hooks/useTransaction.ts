import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionSignature } from '@solana/web3.js';
import { useWalletStore } from '@/stores/useWalletStore';

interface TransactionResult {
    signature: TransactionSignature;
    error?: string;
}

export function useTransaction() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [isProcessing, setIsProcessing] = useState(false);
    const { setError } = useWalletStore();

    const send = async (transaction: Transaction): Promise<TransactionResult> => {
        if (!publicKey) {
            throw new Error('Wallet not connected');
        }

        setIsProcessing(true);
        try {
            // Get the latest blockhash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            // Send the transaction
            const signature = await sendTransaction(transaction, connection);

            // Wait for confirmation
            const confirmation = await connection.confirmTransaction(signature);

            if (confirmation.value.err) {
                throw new Error('Transaction failed');
            }

            return { signature };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
            setError(errorMessage);
            return { signature: '', error: errorMessage };
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        send,
        isProcessing
    };
}