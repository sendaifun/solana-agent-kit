import { SolanaAgentKit } from "../../index";
import { Keypair, Connection } from "@solana/web3.js";
import bs58 from "bs58";

export async function switchParaToMainWallet(agent: SolanaAgentKit) {
  try {
    agent.wallet = Keypair.fromSecretKey(
      bs58.decode(process.env.SOLANA_PRIVATE_KEY as string),
    );
    agent.wallet_address = agent.wallet.publicKey;
    agent.connection = new Connection(process.env.RPC_URL as string);

    return {
      message: "Pre-generated wallet deactivated successfully.",
      address: agent.wallet_address,
    };
  } catch (error: any) {
    throw new Error(`deactivate pregen wallet failed ${error.message}`);
  }
}
