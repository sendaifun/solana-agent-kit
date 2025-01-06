export class SolanaClient {
  async executeTrade(trade: { action: string; token: string; amount: number }) {
      console.log(`Executing trade: ${trade.action} ${trade.amount} of ${trade.token}`);
      return { success: true };
  }
}