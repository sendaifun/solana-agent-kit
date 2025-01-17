export const getExplorerUrl = (path: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet') => {
    // Use the testnet explorer for devnet transactions
    const baseUrl = 'https://explorer.solana.com';
    const clusterParam = cluster === 'devnet' ? '?cluster=custom&customUrl=https://api.devnet.solana.com' : '';
    return `${baseUrl}${path}${clusterParam}`;
};