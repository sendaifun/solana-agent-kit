interface WalletDisplayProps {
    walletAddress?: string;
  }
  
  export const WalletDisplay = ({ walletAddress }: WalletDisplayProps) => (
    <div className="text-center flex flex-col gap-2">
      <h2 className="text-xl font-bold">You are logged in!</h2>
      {walletAddress ? (
        <p>
          Your first wallet address is: <strong>{walletAddress}</strong>
        </p>
      ) : (
        <p>No wallet found.</p>
      )}
    </div>
  );