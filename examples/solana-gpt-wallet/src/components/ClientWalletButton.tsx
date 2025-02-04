import dynamic from 'next/dynamic';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { useWalletStore } from '@/stores/useWalletStore';

const WalletMultiButtonDynamic = dynamic(
    () => Promise.resolve(WalletMultiButton),
    {
        ssr: false,
        loading: () => (
            <button
                className="wallet-adapter-button wallet-adapter-button-loading"
                disabled
            >
                Loading...
            </button>
        )
    }
);

export const ClientWalletButton = () => {
    const { publicKey, connected } = useWallet();
    const { setIsConnected, setPublicKey } = useWalletStore();

    useEffect(() => {
        setIsConnected(connected);
        setPublicKey(publicKey);
    }, [connected, publicKey, setIsConnected, setPublicKey]);

    return <WalletMultiButtonDynamic />;
};