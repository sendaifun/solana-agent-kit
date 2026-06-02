import { SolanaAgentKit } from "solana-agent-kit";
import { SolanaStreamClient, ICluster } from "@streamflow/stream";

export async function getStreamData(
  agent: SolanaAgentKit,
  streamId: string,
) {
  try {
    const streamClient = new SolanaStreamClient(
      agent.connection.rpcEndpoint,
      ICluster.Mainnet,
      "confirmed",
    );

    const stream = await streamClient.getOne({ id: streamId });

    return {
      status: "success",
      stream: {
        sender: stream.sender,
        recipient: stream.recipient,
        mint: stream.mint,
        depositedAmount: stream.depositedAmount.toString(),
        withdrawnAmount: stream.withdrawnAmount.toString(),
        startTime: stream.start,
        endTime: stream.end,
        cliff: stream.cliff,
        cliffAmount: stream.cliffAmount.toString(),
        period: stream.period,
        amountPerPeriod: stream.amountPerPeriod.toString(),
        cancelableBySender: stream.cancelableBySender,
        cancelableByRecipient: stream.cancelableByRecipient,
        transferableBySender: stream.transferableBySender,
        transferableByRecipient: stream.transferableByRecipient,
        automaticWithdrawal: stream.automaticWithdrawal,
        name: stream.name,
        closed: stream.closed,
        createdAt: stream.createdAt,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to get stream data: ${error.message}`);
  }
}
