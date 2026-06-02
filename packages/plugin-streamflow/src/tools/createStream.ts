import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { SolanaStreamClient, ICluster, getBN } from "@streamflow/stream";

export async function createStream(
  agent: SolanaAgentKit,
  params: {
    recipient: string;
    mint: string;
    depositedAmount: number;
    decimals: number;
    period: number;
    start?: number;
    cliff?: number;
    cliffAmount?: number;
    amountPerPeriod?: number;
    cancelableBySender?: boolean;
    cancelableByRecipient?: boolean;
    transferableBySender?: boolean;
    transferableByRecipient?: boolean;
    automaticWithdrawal?: boolean;
    name?: string;
  },
) {
  try {
    const streamClient = new SolanaStreamClient(
      agent.connection.rpcEndpoint,
      ICluster.Mainnet,
      "confirmed",
    );

    const now = Math.floor(Date.now() / 1000);
    const result = await streamClient.create(
      {
        recipient: params.recipient,
        tokenId: params.mint,
        amount: getBN(params.depositedAmount, params.decimals),
        name: params.name ?? "",
        cliffAmount: params.cliffAmount !== undefined
          ? getBN(params.cliffAmount, params.decimals)
          : getBN(0, params.decimals),
        amountPerPeriod: params.amountPerPeriod !== undefined
          ? getBN(params.amountPerPeriod, params.decimals)
          : getBN(0, params.decimals),
        period: params.period,
        start: params.start ?? now,
        cliff: params.cliff ?? (params.start ?? now),
        cancelableBySender: params.cancelableBySender ?? true,
        cancelableByRecipient: params.cancelableByRecipient ?? false,
        transferableBySender: params.transferableBySender ?? true,
        transferableByRecipient: params.transferableByRecipient ?? true,
        canTopup: true,
        automaticWithdrawal: params.automaticWithdrawal ?? false,
        canPause: false,
        canUpdateRate: false,
      },
      { sender: agent.wallet as any },
    );

    return {
      status: "success",
      signature: result.txId,
      metadataId: result.metadataId,
      message: `Stream created successfully with ${params.depositedAmount} tokens for ${params.recipient}`,
    };
  } catch (error: any) {
    throw new Error(`Failed to create stream: ${error.message}`);
  }
}
