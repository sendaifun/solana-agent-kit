export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Test helper addresses are useful for testing
export const TEST_ADDRESSES = {
    alice: "5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8",
    bob: "5MYGMMafYr7G3epWUxk6PzxFvCDwpQQNYFyKBx4NFQKS",
    charlie: "7JYVyxLJyejBEpzKXgpKzZxmRN1qapYCvdXK5SbBTykr"
};

// Add some useful new functions
export const getExplorerUrl = (path: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet') => {
    const baseUrl = 'https://solscan.io';
    const clusterParam = cluster === 'devnet' ? '?cluster=devnet' : '';
    return `${baseUrl}${path}${clusterParam}`;
};

export const retryAsync = async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === retries - 1) throw e;
            await sleep(delay);
        }
    }
    throw new Error('Max retries reached');
};