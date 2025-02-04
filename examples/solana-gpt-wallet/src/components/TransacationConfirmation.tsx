import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, X } from 'lucide-react';

interface TransactionConfirmationProps {
    amount: number;
    toAddress: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
                                                                             amount,
                                                                             toAddress,
                                                                             onConfirm,
                                                                             onCancel
                                                                         }) => {
    return (
        <div className="mt-4 p-4 rounded-lg bg-black/40 border border-yellow-500/50">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="space-y-2 flex-1">
                    <h4 className="font-medium text-white">Confirm Transaction</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                        <p>Amount: <span className="text-white">{amount} SOL</span></p>
                        <p>To: <span className="text-white font-mono">{toAddress}</span></p>
                        <p className="text-yellow-500/80 text-xs mt-2">
                            ⚠️ Please verify the address. Transactions cannot be reversed.
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={onConfirm}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Confirm
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionConfirmation;