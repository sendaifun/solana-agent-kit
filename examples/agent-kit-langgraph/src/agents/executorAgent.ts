export const executeTrades = async (
  trades: { action: string; token: string; amount: number }[],
  solanaClient: { executeTrade: (trade: { action: string; token: string; amount: number }) => Promise<any> }
) => {
  for (const trade of trades) {
      await solanaClient.executeTrade(trade);
  }
  return { success: true };
};
