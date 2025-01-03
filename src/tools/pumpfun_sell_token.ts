import { SolanaAgentKit } from "../index";
import { PublicKey, Transaction } from "@solana/web3.js";
import{
    Pumplend
} from "@pumplend/pumplend-sdk"
/**
 * Buy pumpfun token via pumplend SDK
 * @param agent SolanaAgentKit instance
 * @param token Pumpfun token address
 * @param minSolOut Miniment Sol out
 * @param amount Buy Token Amount
 * @returns Transaction signature
 */
export async function pumpfun_sell_token(
  agent: SolanaAgentKit,
  token: PublicKey,
  minSolOut: number,
  amount: number,
): Promise<string> {
  try {
    let tx: string;
    const pump = new Pumplend();
    const txn = await pump.pump_sell(
        token,
        agent.wallet.publicKey,
        minSolOut,
        amount
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
