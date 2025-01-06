export const analyzePortfolio = async (portfolio: { name: string; balance: number }[]) => {
  
  return portfolio.map(token => ({
      ...token,
      trend: Math.random() > 0.5 ? "up" : "down",
      score: Math.random() * 100
  }));
};
