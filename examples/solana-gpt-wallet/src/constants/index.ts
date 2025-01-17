import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const NETWORK = WalletAdapterNetwork.Devnet;

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export const SUPPORTED_TOKENS = {
    SOL: {
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        address: 'native'
    },
    USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    }
};

export const GPT_PROMPT_TEMPLATE = `I am a Solana wallet assistant. I can help you with:
- Sending SOL or tokens
- Swapping tokens
- Checking balances
- Managing your wallet

Please tell me what you'd like to do in simple English.`;