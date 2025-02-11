import '@/styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import '@/styles/wallet-button.css';
import '@/styles/transitions.css';
import '@/styles/wallet-states.css';
import type { AppProps } from 'next/app';
import { ClientWalletProvider } from '@/components/wallet/ClientWalletProvider';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ClientWalletProvider>
            <Component {...pageProps} />
        </ClientWalletProvider>
    );
}