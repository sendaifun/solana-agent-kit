import { SolanaAgentKit } from "solana-agent-kit";
import { SolanaStreamClient, ICluster, getBN } from "@streamflow/stream";

export async function withdrawFromStream(
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

    const result = await streamClient.withdraw(
      {
        id: streamId,
        amount: getBN(amount, decimals),
      },
      { invoker: agent.wallet as any },
    );

    return {
      status: "success",
      signature: result.txId,
      message: `Withdrew ${amount} tokens from stream ${streamId}`,
    };
  } catch (error: any) {
    throw new Error(`Failed to withdraw from stream: ${error.message}`);
  }
}
