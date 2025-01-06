export const calculatePortfolioValue = (
  portfolio: { name: string; balance: number }[],
  prices: { [key: string]: number }
) => {
  return portfolio.reduce((acc: number, token) => acc + token.balance * prices[token.name], 0);
};