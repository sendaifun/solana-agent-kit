import { signOrSendTX, SolanaAgentKit } from "solana-agent-kit";
import { magicedenClient } from "../constants";
import { VersionedTransaction } from "@solana/web3.js";

interface BidOnNftResponse {
  tx: Tx;
  txSigned: Tx;
}

interface Tx {
  type: string;
  data: number[];
}

/**
 * Bid on an NFT listed on Magic Eden
 * @param agent SolanaAgentKit instance
 * @param tokenMint The mint address of the NFT to bid on
 * @param price The price in SOL to bid for the NFT
 * @param options Optional parameters for auction house address and buyer referral
 */
export async function bid_on_magiceden_nft(
  agent: SolanaAgentKit,
  tokenMint: string,
  price: number,
  options: {
    auctionHouseAddress?: string; // Optional auction house address
    buyerReferral?: string; // Optional buyer referral address
  } = {},
) {
  try {
    if (!agent.config.MAGIC_EDEN_API_KEY) {
      throw new Error("Magic Eden API key is required to bid on NFTs");
    }

    const res = await magicedenClient.get<BidOnNftResponse>(
      "/instructions/buy",
      {
        params: {
          buyer: agent.wallet.publicKey.toBase58(),
          tokenMint,
          price: price,
          auctionHouseAddress: options.auctionHouseAddress || null,
          buyerReferral: options.buyerReferral || null,
        },
        headers: {
          Authorization: `Bearer ${agent.config.MAGIC_EDEN_API_KEY}`,
        },
      },
    );

    if (!res.data || !res.data.tx || !res.data.txSigned) {
      throw new Error("Invalid response from Magic Eden API");
    }

    const txBuffer = new Uint8Array(res.data.txSigned.data);
    const tx = VersionedTransaction.deserialize(txBuffer);
    const result = await signOrSendTX(agent, tx);

    if (agent.config.signOnly) {
      return {
        signedTransaction: result as VersionedTransaction,
      };
    }

    return {
      signature: result as string,
    };
  } catch (e: any) {
    throw new Error(`Failed to bid on NFT: ${e.message}`);
  }
}
