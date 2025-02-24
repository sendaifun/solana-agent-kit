import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Connection } from '@solana/web3.js';

interface Props {
    children: ReactNode;
}

export const ClientWalletProvider: FC<Props> = ({ children }) => {
    // You can switch between 'mainnet-beta' and 'devnet'
    const network = process.env.NEXT_PUBLIC_NETWORK === 'devnet'
        ? WalletAdapterNetwork.Devnet
        : WalletAdapterNetwork.Mainnet;

    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;

    // Custom connection configuration
    const connection = useMemo(
        () => new Connection(endpoint, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000,
            disableRetryOnRateLimit: false,
        }),
        [endpoint]
    );

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};