import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    PublicKey,
    TokenAmount
} from '@solana/web3.js';
import { useWalletStore } from '@/stores/useWalletStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientWalletButton } from '@/components/ClientWalletButton';
import { GPTService, WalletCommand } from '@/services/gpt.service'; // <-- your GPTService file
import { handleSolanaError } from '@/utils/error-handlers';
import { RecentTransactions } from '@/components/transactions/RecentTransactions';
import {
    formatAddress,
    getExplorerUrl,
    retryAsync,
    sleep
} from '@/utils/wallet-utils';

import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCcw,
    Command,
    Sparkles,
    Loader2,
    Zap,
    Copy,
    ExternalLink,
    AlertCircle,
    Check,
    X,
    AlertOctagon
} from 'lucide-react';

// ----------------------------------------------------------------
// Initialize GPT service
// Make sure your NEXT_PUBLIC_OPENAI_API_KEY is set in .env
// ----------------------------------------------------------------
const gptService = new GPTService(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');

// We’ll track errors in a simple interface
type TransactionError = {
    type: 'error' | 'warning';
    message: string;
    details?: string;
};

const DEVNET_USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

const WalletDashboard: React.FC = () => {
    // ----------------------------------------------------------------
    // Wallet + Connection
    // ----------------------------------------------------------------
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    // ----------------------------------------------------------------
    // State
    // ----------------------------------------------------------------
    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [response, setResponse] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [airdropInProgress, setAirdropInProgress] = useState(false);
    const [pendingTransaction, setPendingTransaction] = useState<WalletCommand | null>(null);
    const [transactionError, setTransactionError] = useState<TransactionError | null>(null);
    const [transactionInProgress, setTransactionInProgress] = useState(false);

    // We'll track SOL + USDC balances
    const { balance, setBalance, setError } = useWalletStore();
    const [usdcBalance, setUsdcBalance] = useState<number>(0);

    // ----------------------------------------------------------------
    // Effects
    // ----------------------------------------------------------------

    // Auto-clear any transaction error after 5s
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (transactionError) {
            timeoutId = setTimeout(() => {
                setTransactionError(null);
            }, 5000);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [transactionError]);

    // On wallet connect/disconnect
    useEffect(() => {
        if (publicKey) {
            updateBalance();
            updateUsdcBalance();
            fetchRecentTransactions();
            setShowBalance(true);
        } else {
            setBalance(0);
            setUsdcBalance(0);
            setRecentTransactions([]);
            setShowBalance(false);
            setPendingTransaction(null);
            setTransactionError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey]);

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    const updateBalance = async () => {
        if (!publicKey) return;
        try {
            const balanceLamports = await connection.getBalance(publicKey);
            setBalance(balanceLamports / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error('Error fetching SOL balance:', error);
            setError('Failed to fetch balance');
        }
    };

    // Fetch your USDC (devnet) token account and display the balance
    // By default, you must have a token account for USDC and some tokens in it
    const updateUsdcBalance = async () => {
        if (!publicKey) return;
        try {
            // This returns all your token accounts, filtering by the devnet USDC mint
            const tokenAccounts = await connection.getTokenAccountsByOwner(
                publicKey,
                { mint: DEVNET_USDC_MINT }
            );

            if (tokenAccounts.value.length === 0) {
                // Means no USDC token account or 0 balance
                setUsdcBalance(0);
                return;
            }

            // Typically you'll want the largest account or sum them
            const accountInfo = tokenAccounts.value[0].account.data;
            // Decode using the SPL Token standards:
            // The easiest way is to use @solana/spl-token, but here's a quick manual decode:
            const rawData = Buffer.from(accountInfo);
            // Account layout is 165 bytes. The last 8 bytes in that buffer is the amount
            // But let's do a quick approach with the "TokenAmount" helper:
            // Alternatively, use the `@solana/spl-token` library's getOrCreateAssociatedTokenAccount
            // approach. This is a simpler hack:
            // new TokenAmount(rawData, decimals) is not actually from web3, but from old Serum code.
            // We'll do manual decode if needed. For brevity, let's just do a quick approach:
            // This is *pseudo-code*, might need to parse properly from the SPL token layout.

            // A simpler approach: use "spl-token" library or the official IDL layout.
            // For demonstration, let's do a quick parse using the standard 64-bit at offset 64:
            const amountBuffer = rawData.subarray(64, 72);
            const amountBn = amountBuffer.readBigUInt64LE(0);

            // USDC has 6 decimals on devnet
            const decimalFactor = 10n ** 6n;
            const usdcAmount = Number(amountBn) / Number(decimalFactor);
            setUsdcBalance(usdcAmount);
        } catch (error) {
            console.error('Error fetching USDC balance:', error);
            setUsdcBalance(0);
        }
    };

    const fetchRecentTransactions = async () => {
        if (!publicKey || isLoadingTransactions) return;
        setIsLoadingTransactions(true);
        try {
            const signatures = await connection.getSignaturesForAddress(
                publicKey,
                { limit: 5 }
            );
            setRecentTransactions(signatures);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setResponse(
                'Failed to fetch recent transactions. This is normal for new wallets.'
            );
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    // Validate we have enough SOL for a transaction
    const validateTransaction = useCallback(
        (amount: number): boolean => {
            if (amount <= 0) {
                setTransactionError({
                    type: 'error',
                    message: 'Invalid amount',
                    details: 'Amount must be greater than 0'
                });
                return false;
            }
            if (amount > balance) {
                setTransactionError({
                    type: 'error',
                    message: 'Insufficient balance',
                    details: `You need ${amount} SOL but only have ${balance.toFixed(4)} SOL`
                });
                return false;
            }
            return true;
        },
        [balance]
    );

    // Airdrop 2 SOL on devnet
    const requestAirdrop = async () => {
        if (!publicKey || airdropInProgress) return;
        setAirdropInProgress(true);

        try {
            const signature = await retryAsync(async () => {
                const sig = await connection.requestAirdrop(
                    publicKey,
                    2 * LAMPORTS_PER_SOL
                );
                setResponse('Airdrop requested. Waiting for confirmation...');
                return sig;
            }, 3);

            // Wait for confirmation or timeout
            const confirmationPromise = connection.confirmTransaction(signature);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Confirmation timeout')), 20000)
            );
            await Promise.race([confirmationPromise, timeoutPromise]);

            await sleep(1000); // short delay
            await updateBalance();
            await fetchRecentTransactions();
            setResponse('Successfully received 2 test SOL!');
        } catch (error) {
            console.error('Airdrop error:', error);
            const errorResult = handleSolanaError(error);
            setTransactionError({
                type: 'error',
                message: 'Airdrop failed',
                details: errorResult.message
            });
            setResponse(
                'Failed to request test SOL. Please try again in a moment.'
            );
        } finally {
            setAirdropInProgress(false);
        }
    };

    // ----------------------------------------------------------------
    // GPT Input
    // ----------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !publicKey) return;

        setProcessing(true);
        setIsTyping(true);
        setTransactionError(null);

        try {
            const gptResponse = await gptService.processUserInput(
                input,
                publicKey.toString(),
                balance
            );

            // Based on the action, decide if we need to confirm
            switch (gptResponse.action) {
                case 'send':
                    // If we have a fully-parsed send command
                    if (gptResponse.amount && gptResponse.toAddress) {
                        if (validateTransaction(gptResponse.amount)) {
                            setPendingTransaction(gptResponse);
                        }
                    }
                    break;

                case 'swap':
                    // The GPT service attempts to fetch a Jupiter quote.
                    // If it succeeded, we get a requiresConfirmation: true
                    // Then we show a "Confirm Swap" UI
                    if (gptResponse.error) {
                        setTransactionError({
                            type: 'warning',
                            message: gptResponse.error
                        });
                    }
                    if (gptResponse.requiresConfirmation) {
                        setPendingTransaction(gptResponse);
                    }
                    break;

                case 'check_balance':
                    await updateBalance();
                    await updateUsdcBalance();
                    break;

                case 'show_history':
                    await fetchRecentTransactions();
                    break;

                default:
                    // e.g. 'ask_address' or 'receive' or anything else
                    // just show the GPT message
                    break;
            }

            if (gptResponse.error) {
                setTransactionError({
                    type: 'warning',
                    message: gptResponse.error
                });
            }
            setResponse(gptResponse.message);
        } catch (error) {
            console.error('Error processing command:', error);
            setResponse('Sorry, I encountered an error processing your request.');
            setTransactionError({
                type: 'error',
                message: 'Processing Error',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            setIsTyping(false);
            setProcessing(false);
            if (!pendingTransaction) {
                setInput('');
            }
        }
    };

    // ----------------------------------------------------------------
    // Execute "Send" transaction
    // ----------------------------------------------------------------
    const executeTransaction = async (command: WalletCommand) => {
        if (!publicKey || !command.toAddress || !command.amount) return;
        if (!validateTransaction(command.amount)) {
            setPendingTransaction(null);
            return;
        }

        setTransactionInProgress(true);
        try {
            const toPublicKey = new PublicKey(command.toAddress);

            if (toPublicKey.equals(publicKey)) {
                throw new Error('Cannot send SOL to your own address');
            }

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: toPublicKey,
                    lamports: command.amount * LAMPORTS_PER_SOL
                })
            );

            try {
                const signature = await sendTransaction(transaction, connection);
                setResponse('Transaction sent! Waiting for confirmation...');

                const confirmationPromise = connection.confirmTransaction(signature);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Transaction confirmation timeout')),
                        30000
                    )
                );
                await Promise.race([confirmationPromise, timeoutPromise]);

                await sleep(1000);
                await updateBalance();
                await fetchRecentTransactions();

                setResponse(
                    `Successfully sent ${command.formattedAmount} to ${formatAddress(
                        command.toAddress
                    )}`
                );
            } catch (error: any) {
                if (
                    error?.message?.includes('rejected') ||
                    error?.message?.toLowerCase().includes('user rejected')
                ) {
                    setTransactionError({
                        type: 'warning',
                        message: 'Transaction Cancelled',
                        details: 'You cancelled the transaction in your wallet.'
                    });
                    setResponse('Transaction cancelled by user in wallet.');
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Transaction error:', error);
            const errorResult = handleSolanaError(error);
            setTransactionError({
                type: 'error',
                message: 'Transaction failed',
                details: errorResult.message
            });
        } finally {
            setTransactionInProgress(false);
            setPendingTransaction(null);
        }
    };

    // ----------------------------------------------------------------
    // Execute "Swap"
    // ----------------------------------------------------------------
    // This is where you'd actually call Jupiter to finalize the swap.
    // The code in your gpt.service.ts only obtains a quote.
    // For a real swap, you must build a Jupiter transaction, sign it, etc.
    // For demonstration, we just "simulate" success here.
    const executeSwap = async (command: WalletCommand) => {
        if (!publicKey || !command.amount || !command.fromToken || !command.toToken) return;

        setTransactionInProgress(true);
        try {
            // If you want to do a real Jupiter swap, you’d do something like:
            //
            // 1) import Jupiter or use your existing connection
            // 2) build route + transaction instructions from the quote
            // 3) sign + send
            //
            // But for now, we just simulate:
            await sleep(1500);

            // Update balances
            await updateBalance();
            await updateUsdcBalance();

            setResponse(
                `Swap executed! You swapped ${command.formattedAmount} of ${command.fromToken} -> ${command.toToken}. (Simulated)`
            );
        } catch (error) {
            console.error('Swap error:', error);
            const errorResult = handleSolanaError(error);
            setTransactionError({
                type: 'error',
                message: 'Swap failed',
                details: errorResult.message
            });
        } finally {
            setTransactionInProgress(false);
            setPendingTransaction(null);
        }
    };

    // ----------------------------------------------------------------
    // Render: If wallet not connected, show "welcome" screen
    // ----------------------------------------------------------------
    if (!publicKey) {
        return (
            <div className="relative min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[300px] h-[300px] bg-cyan-500/5 rounded-full animate-pulse" />
                    <div className="absolute w-[500px] h-[500px] bg-cyan-500/5 rounded-full animate-pulse delay-75" />
                </div>

                <div className="relative z-10 text-center space-y-8 p-8 backdrop-blur-xl bg-black/30 rounded-2xl border border-gray-800 shadow-2xl max-w-lg mx-4">
                    <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 animate-bounce">
                            <Wallet className="w-12 h-12 text-cyan-400" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                            Welcome to Solana GPT Wallet
                        </h1>
                        <p className="text-gray-400 max-w-sm mx-auto">
                            Your AI-powered gateway to Solana. Connect your wallet to manage assets with natural language.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-sm">
                            <div className="mb-3 text-sm text-cyan-300 font-medium">
                                Connect Wallet to Start
                            </div>
                            <div className="welcome-wallet-button">
                                <ClientWalletButton />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 text-xs text-gray-500">
                            <div className="flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Powered by Solana & GPT</span>
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/5">
                                ⚠️ Running on Devnet - Perfect for testing!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------
    // Render: Main Dashboard
    // ----------------------------------------------------------------
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative w-full max-w-4xl mx-auto p-4 pt-20">
                <div className="backdrop-blur-xl bg-black/30 rounded-2xl border border-gray-800 shadow-2xl p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-cyan-400" />
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                                Solana GPT Wallet
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={requestAirdrop}
                                disabled={airdropInProgress}
                                className="bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 text-white min-w-[160px] font-medium"
                            >
                                {airdropInProgress ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Zap className="w-4 h-4 mr-2" />
                                )}
                                Request Test SOL
                            </Button>
                            <ClientWalletButton />
                        </div>
                    </div>

                    {/* Error Display */}
                    {transactionError && (
                        <div
                            className={`mb-4 p-4 rounded-lg border ${
                                transactionError.type === 'error'
                                    ? 'bg-red-500/10 border-red-500/50 text-red-400'
                                    : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <AlertOctagon className="w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="font-medium">{transactionError.message}</p>
                                    {transactionError.details && (
                                        <p className="text-sm opacity-80 mt-1">
                                            {transactionError.details}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Balance Card */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-black to-gray-900 p-8 mb-8">
                        <div className="absolute inset-0 bg-grid-white/10 pointer-events-none" />
                        <div className={`transition-all duration-1000 transform ${showBalance ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-gray-400">Wallet Balance</p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                updateBalance();
                                                updateUsdcBalance();
                                            }}
                                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Currency Grid */}
                                    <div className="grid gap-4">
                                        {/* SOL Balance */}
                                        <div className="p-4 rounded-lg bg-black/40 border border-gray-800/50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">SOL</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {balance.toFixed(4)}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Native Token
                                                </div>
                                            </div>
                                        </div>

                                        {/* USDC Balance */}
                                        <div className="p-4 rounded-lg bg-black/40 border border-gray-800/50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">USDC</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {usdcBalance.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Stablecoin
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Wallet Address */}
                                    <div className="mt-6">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-500 bg-black/40 px-2 py-1 rounded-md border border-gray-800">
                                                {formatAddress(publicKey.toString())}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 bg-black/40 hover:bg-gray-800/40"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(publicKey.toString());
                                                    setResponse('Address copied to clipboard!');
                                                }}
                                            >
                                                <Copy className="h-3.5 w-3.5 text-gray-400" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setInput('send')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 text-white"
                                        >
                                            <ArrowUpRight className="w-4 h-4" />
                                            Send
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setInput('swap')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 text-white"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                            Swap
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                navigator.clipboard.writeText(publicKey.toString());
                                                setResponse('Address copied! Share this to receive tokens.');
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 text-white"
                                        >
                                            <ArrowDownLeft className="w-4 h-4" />
                                            Receive
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GPT Interface */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-4">
                            <Command className="w-5 h-5" />
                            <p>Ask me anything about your wallet</p>
                        </div>

                        <form onSubmit={handleSubmit} className="relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g. 'Send 0.1 SOL to ...', 'Swap 0.5 SOL to USDC', 'Check my balance', 'Show recent transactions'"
                                className="bg-black/40 border-gray-800 text-white placeholder:text-gray-500"
                                disabled={processing || transactionInProgress}
                            />
                            <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                disabled={processing || !input.trim() || transactionInProgress}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                                {processing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                            </Button>
                        </form>

                        {/* GPT/AI Response */}
                        {(response || isTyping) && (
                            <div className="mt-4 p-4 rounded-lg bg-black/40 border border-gray-800">
                                {isTyping ? (
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                ) : (
                                    <p className="text-gray-300">{response}</p>
                                )}
                            </div>
                        )}

                        {/* Confirm SEND */}
                        {pendingTransaction && pendingTransaction.action === 'send' && (
                            <div className="mt-4 p-4 rounded-lg bg-black/40 border border-yellow-500/50">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-medium text-white">Confirm Send</h4>
                                        <div className="space-y-1 text-sm text-gray-400">
                                            <p>
                                                Amount:{' '}
                                                <span className="text-white">
                                                    {pendingTransaction.formattedAmount}
                                                </span>
                                            </p>
                                            <p>
                                                To:{' '}
                                                <span className="text-white font-mono">
                                                    {formatAddress(
                                                        pendingTransaction.toAddress || ''
                                                    )}
                                                </span>
                                            </p>
                                            <p className="text-yellow-500/80 text-xs mt-2">
                                                ⚠️ Please verify the address. Transactions cannot be reversed.
                                            </p>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                onClick={() => executeTransaction(pendingTransaction)}
                                                disabled={transactionInProgress}
                                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                            >
                                                {transactionInProgress ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4 mr-2" />
                                                )}
                                                Confirm
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setPendingTransaction(null);
                                                    setResponse('Transaction cancelled by user.');
                                                }}
                                                disabled={transactionInProgress}
                                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirm SWAP */}
                        {pendingTransaction && pendingTransaction.action === 'swap' && (
                            <div className="mt-4 p-4 rounded-lg bg-black/40 border border-yellow-500/50">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-medium text-white">Confirm Swap</h4>
                                        <div className="space-y-1 text-sm text-gray-400">
                                            <p>
                                                From:{' '}
                                                <span className="text-white">
                                                    {pendingTransaction.formattedAmount}
                                                </span>{' '}
                                                {pendingTransaction.fromToken}
                                            </p>
                                            <p>
                                                To:{' '}
                                                <span className="text-white">
                                                    {pendingTransaction.toToken}
                                                </span>
                                            </p>
                                            <p className="text-yellow-500/80 text-xs mt-2">
                                                ⚠️ Verify the price impact is acceptable.
                                            </p>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                onClick={() => executeSwap(pendingTransaction)}
                                                disabled={transactionInProgress}
                                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                            >
                                                {transactionInProgress ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4 mr-2" />
                                                )}
                                                Confirm Swap
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setPendingTransaction(null);
                                                    setResponse('Swap cancelled by user.');
                                                }}
                                                disabled={transactionInProgress}
                                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Transactions */}
                        <RecentTransactions
                            transactions={recentTransactions}
                            isLoading={isLoadingTransactions}
                            walletAddress={publicKey.toString()}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative text-center py-8 mt-8">
                <div className="text-sm text-gray-500 space-y-2">
                    <p>Running on Solana Devnet</p>
                    <div className="flex items-center justify-center gap-4">
                        <a
                            href={getExplorerUrl(`/account/${publicKey?.toString()}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            View in Explorer
                        </a>
                        <button
                            onClick={() => {
                                if (publicKey) {
                                    navigator.clipboard.writeText(publicKey.toString());
                                    setResponse('Address copied to clipboard!');
                                }
                            }}
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                        >
                            <Copy className="w-3 h-3" />
                            Copy Address
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WalletDashboard;