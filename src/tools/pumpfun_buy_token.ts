import { SolanaAgentKit } from "../index";
import { PublicKey, Transaction } from "@solana/web3.js";
import{
    Pumplend
} from "@pumplend/pumplend-sdk"
/**
 * Buy pumpfun token via pumplend SDK
 * @param agent SolanaAgentKit instance
 * @param token Pumpfun token address
 * @param amount Buy Token Amount
 * @param maxSolCost How much SOL max cost
 * @returns Transaction signature
 */
export async function pumpfun_buy_token(
  agent: SolanaAgentKit,
  token: PublicKey,
  amount: number,
  maxSolCost: number,
): Promise<string> {
  try {
    let tx: string;
    const pump = new Pumplend();
    const txn = await pump.pump_buy(
        token,
        agent.wallet.publicKey,
        amount,
        maxSolCost
      )
    if(!txn)
    {
        throw new Error(`Txn Generation Failed`);
    }
    const transaction = new Transaction().add(
        txn
    );
    tx = await agent.connection.sendTransaction(transaction, [agent.wallet]);
    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
}
