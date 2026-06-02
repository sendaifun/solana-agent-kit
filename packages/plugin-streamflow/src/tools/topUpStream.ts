import { SolanaAgentKit } from "solana-agent-kit";
import { SolanaStreamClient, ICluster, getBN } from "@streamflow/stream";

export async function topUpStream(
  agent: SolanaAgentKit,
  streamId: string,
  amount: number,
  decimals: number,
) {
  try {
    const streamClient = new SolanaStreamClient(
      agent.connection.rpcEndpoint,
      ICluster.Mainnet,
      "confirmed",
    );

    const result = await streamClient.topup(
      {
        id: streamId,
        amount: getBN(amount, decimals),
      },
      { invoker: agent.wallet as any },
    );

    return {
      status: "success",
      signature: result.txId,
      message: `Topped up stream ${streamId} with ${amount} tokens`,
    };
  } catch (error: any) {
    throw new Error(`Failed to top up stream: ${error.message}`);
  }
}
