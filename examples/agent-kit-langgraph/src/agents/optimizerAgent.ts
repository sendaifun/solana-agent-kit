export const optimizePortfolio = async (
  analysis: { name: string; balance: number; trend: string; score: number }[]
) => {
  // Mock optimization
  return analysis.filter(token => token.score > 50).map(token => ({
      action: token.trend === "up" ? "buy" : "sell",
      token: token.name,
      amount: Math.random() * 10
  }));
};
