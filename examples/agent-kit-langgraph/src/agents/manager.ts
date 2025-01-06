import { analyzePortfolio } from "./analyzerAgent";
import { optimizePortfolio } from "./optimizerAgent";
import { executeTrades } from "./executorAgent";
export const managePortfolio = async (
    portfolio: { name: string; balance: number }[],
    solanaClient: { executeTrade: (trade: { action: string; token: string; amount: number }) => Promise<any> }
) => {
    const analysis = await analyzePortfolio(portfolio);
    const trades = await optimizePortfolio(analysis);
    const result = await executeTrades(trades, solanaClient);
    return result;
};