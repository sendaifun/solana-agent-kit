import Head from 'next/head';
import WalletDashboard from '@/components/WalletDashboard';

export default function Home() {
    return (
        <>
            <Head>
                <title>Solana GPT Wallet</title>
                <meta name="description" content="Interact with your Solana wallet using natural language" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <WalletDashboard />
        </>
    );
}