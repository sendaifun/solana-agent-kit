import { OPEN_BOOK_PROGRAM, Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import { MintLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";

export async function openbookCreateMarket(
  agent: SolanaAgentKit,

  baseMint: PublicKey,
  quoteMint: PublicKey,

  lotSize: number = 1,
  tickSize: number = 0.01,
): Promise<string[]> {

  const raydium = await Raydium.load({
    owner: agent.wallet,
    connection: agent.connection,
  })

  const baseMintInfo = await agent.connection.getAccountInfo(baseMint)
  const quoteMintInfo = await agent.connection.getAccountInfo(quoteMint)

  if (
    baseMintInfo?.owner.toString() !== TOKEN_PROGRAM_ID.toBase58() ||
    quoteMintInfo?.owner.toString() !== TOKEN_PROGRAM_ID.toBase58()
  ) {
    throw new Error(
      'openbook market only support TOKEN_PROGRAM_ID mints, if you want to create pool with token-2022, please create raydium cpmm pool instead'
    )
  }

  const { execute } = await raydium.marketV2.create({
    baseInfo: {
      mint: baseMint,
      decimals: MintLayout.decode(baseMintInfo.data).decimals,
    },
    quoteInfo: {
      mint: quoteMint,
      decimals: MintLayout.decode(quoteMintInfo.data).decimals,
    },
    lotSize,
    tickSize,
    dexProgramId: OPEN_BOOK_PROGRAM,

    txVersion: TxVersion.V0,
  })

  const { txIds } = await execute({ sequentially: true, })

  return txIds
}
