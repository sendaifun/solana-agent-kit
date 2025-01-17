export interface WalletTransaction {
    signature: string;
    timestamp: number;
    type: 'send' | 'receive' | 'swap';
    amount: number;
    token: string;
    status: 'pending' | 'confirmed' | 'failed';
}

export interface TokenInfo {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
}

export interface SwapQuote {
    inputAmount: number;
    outputAmount: number;
    route: string[];
    priceImpact: number;
    fee: number;
}

export interface GPTCommand {
    action: 'send' | 'swap' | 'receive' | 'check_balance';
    amount?: number;
    token?: string;
    recipient?: string;
    description?: string;
}