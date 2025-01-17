import { Connection } from "@solana/web3.js";
import { FluxBeamSwapTool } from "../../tools/fluxbeam/fluxbeam_swap";

export async function executeTokenSwap(
  connection: Connection,
  fromToken: string,
  toToken: string,
  amount: number,
  slippage: number = 0.5
) {
  const swapTool = new FluxBeamSwapTool(connection);
  
  const result = await swapTool._call(
    JSON.stringify({
      fromToken,
      toToken,
      amount,
      slippage,
    })
  );

  const response = JSON.parse(result);
  
  if (!response.success) {
    throw new Error(`Swap failed: ${response.error}`);
  }

  return {
    transaction: response.transaction,
    quote: response.quote,
  };
}