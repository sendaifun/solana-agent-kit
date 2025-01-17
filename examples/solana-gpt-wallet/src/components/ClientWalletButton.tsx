import dynamic from 'next/dynamic';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Dynamically import the wallet button to prevent SSR issues
const WalletMultiButtonDynamic = dynamic(
    () => Promise.resolve(WalletMultiButton),
    {
        ssr: false,
        loading: () => (
            <button
                className="wallet-adapter-button"
                disabled
            >
                Loading...
            </button>
        )
    }
);

export const ClientWalletButton = () => {
    return <WalletMultiButtonDynamic />;
};