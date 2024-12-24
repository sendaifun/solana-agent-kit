import {
  AMM_V4,
  FEE_DESTINATION_ID,
  MARKET_STATE_LAYOUT_V3,
  OPEN_BOOK_PROGRAM,
  Raydium,
  TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import { MintLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { SolanaAgentKit } from "../index";

export async function raydiumCreateAmmV4(
  agent: SolanaAgentKit,
  marketId: PublicKey,
  baseAmount: BN,
  quoteAmount: BN,
  startTime: BN,
): Promise<string> {
  const raydium = await Raydium.load({
    owner: agent.wallet,
    connection: agent.connection,
  });

  const marketBufferInfo = await agent.connection.getAccountInfo(
    new PublicKey(marketId),
  );
  const { baseMint, quoteMint } = MARKET_STATE_LAYOUT_V3.decode(
    marketBufferInfo!.data,
  );

  const baseMintInfo = await agent.connection.getAccountInfo(baseMint);
  const quoteMintInfo = await agent.connection.getAccountInfo(quoteMint);

  if (
    baseMintInfo?.owner.toString() !== TOKEN_PROGRAM_ID.toBase58() ||
    quoteMintInfo?.owner.toString() !== TOKEN_PROGRAM_ID.toBase58()
  ) {
    throw new Error(
      "amm pools with openbook market only support TOKEN_PROGRAM_ID mints, if you want to create pool with token-2022, please create cpmm pool instead",
    );
  }

  if (
    baseAmount
      .mul(quoteAmount)
      .lte(
        new BN(1)
          .mul(new BN(10 ** MintLayout.decode(baseMintInfo.data).decimals))
          .pow(new BN(2)),
      )
  ) {
    throw new Error(
      "initial liquidity too low, try adding more baseAmount/quoteAmount",
    );
  }

  const { execute } = await raydium.liquidity.createPoolV4({
    programId: AMM_V4,
    marketInfo: {
      marketId,
      programId: OPEN_BOOK_PROGRAM,
    },
    baseMintInfo: {
      mint: baseMint,
      decimals: MintLayout.decode(baseMintInfo.data).decimals,
    },
    quoteMintInfo: {
      mint: quoteMint,
      decimals: MintLayout.decode(quoteMintInfo.data).decimals,
    },
    baseAmount,
    quoteAmount,

    startTime,
    ownerInfo: {
      useSOLBalance: true,
    },
    associatedOnly: false,
    txVersion: TxVersion.V0,
    feeDestinationId: FEE_DESTINATION_ID,
  });

  const { txId } = await execute({ sendAndConfirm: true });

  return txId;
}
