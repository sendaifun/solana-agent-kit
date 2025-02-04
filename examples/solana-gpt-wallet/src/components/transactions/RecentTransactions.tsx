import React from 'react';
import { ExternalLink, History, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
    signature: string;
    type: 'receive' | 'send';
    confirmationStatus: string;
    blockTime?: number;
    amount?: number;
}

interface TransactionsProps {
    transactions: Transaction[];
    isLoading: boolean;
    walletAddress: string;
    onRefresh?: () => void;
}


export const RecentTransactions = ({
                                       transactions,
                                       isLoading,
                                       walletAddress,
                                       onRefresh
                                   }: TransactionsProps) => {
    // Helper function to get explorer URL
    const getExplorerUrl = (path: string) => {
        return `https://solscan.io${path}?cluster=mainnet`;
    };

    // Format timestamp
    const formatDate = (timestamp?: number) => {
        if (timestamp === undefined) return 'Pending';
        return new Date(timestamp * 1000).toLocaleString();
    };


    // Format address
    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    {onRefresh && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRefresh}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <Button
                    variant="ghost"
                    className="text-sm text-gray-400 hover:text-white"
                    onClick={() => window.open(getExplorerUrl(`/account/${walletAddress}`), '_blank')}
                >
                    <History className="w-4 h-4 mr-2" />
                    View Full History
                </Button>
            </div>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-lg border border-gray-800" />
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No transactions yet</p>
                        <p className="text-sm mt-2">Your recent transactions will appear here</p>
                    </div>
                ) : (
                    transactions.map((tx, index) => (
                        <a
                            key={index}
                            href={getExplorerUrl(`/tx/${tx.signature}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white/5 border border-gray-800">
                                    {tx.type === 'receive' ? (
                                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">
                                            {tx.type === 'receive' ? 'Received' : 'Sent'}
                                        </span>
                                        <div className={`h-2 w-2 rounded-full ${
                                            tx.confirmationStatus === 'finalized'
                                                ? 'bg-green-400'
                                                : 'bg-yellow-400'
                                        }`} />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {formatAddress(tx.signature)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-white">
                                        {tx.amount?.toFixed(4)} SOL
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(tx.blockTime)}
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    ))
                )}

                {transactions.length > 0 && (
                    <div className="text-center mt-4">
                        <Button
                            variant="ghost"
                            className="text-sm text-gray-400 hover:text-white"
                            onClick={() => window.open(getExplorerUrl(`/account/${walletAddress}`), '_blank')}
                        >
                            View All Transactions
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};