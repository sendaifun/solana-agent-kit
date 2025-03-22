import Image from "next/image";

export const Header = () => (
  <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
        <div className="flex items-center space-x-3">
            <a href="https://wormhole.com/" target="_blank" rel="noopener noreferrer">
                <Image
                    src="/wormhole_white.svg"
                    
        alt="Wormhole Logo"
        width={36}
        height={36}
        className=""
        onError={(e) => {
          e.currentTarget.src = "/next.svg";
        }}
                />
            </a>
      <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Wormhole Agent</h1>
    </div>
        <div className="text-sm font-medium" style={{ color: 'var(--coral)' }}>
            <a href="https://kit.sendai.fun/" target="_blank" rel="noopener noreferrer">
                Powered by Solana Agent Kit
            </a>
        </div>
  </header>
);
