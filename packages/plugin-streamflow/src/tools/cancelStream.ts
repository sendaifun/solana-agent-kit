import { SolanaAgentKit } from "solana-agent-kit";
import { SolanaStreamClient, ICluster } from "@streamflow/stream";

export async function cancelStream(
  agent: SolanaAgentKit,
  streamId: string,
) {
  try {
    const streamClient = new SolanaStreamClient(
      agent.connection.rpcEndpoint,
      ICluster.Mainnet,
      "confirmed",
    );

    const result = await streamClient.cancel(
      { id: streamId },
      { invoker: agent.wallet as any },
    );

    return {
      status: "success",
      signature: result.txId,
      message: `Stream ${streamId} cancelled successfully`,
    };
  } catch (error: any) {
    throw new Error(`Failed to cancel stream: ${error.message}`);
  }
}
