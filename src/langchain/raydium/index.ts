import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaRaydiumCreateAmmV4 extends Tool {
  name = "raydium_create_ammV4";
  description = `Raydium's Legacy AMM that requires an OpenBook marketID
  
    Inputs (input is a json string):
    marketId: string (required)
    baseAmount: number(int), eg: 111111 (required)
    quoteAmount: number(int), eg: 111111 (required)
    startTime: number(seconds), eg: now number or zero (required)
    `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateAmmV4(
        new PublicKey(inputFormat.marketId),
        new BN(inputFormat.baseAmount),
        new BN(inputFormat.quoteAmount),
        new BN(inputFormat.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Raydium amm v4 pool created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRaydiumCreateClmm extends Tool {
  name = "raydium_create_clmm";
  description = `Concentrated liquidity market maker, custom liquidity ranges, increased capital efficiency
  
    Inputs (input is a json string):
    mint1: string (required)
    mint2: string (required)
    configId: string (required) stores pool info, id, index, protocolFeeRate, tradeFeeRate, tickSpacing, fundFeeRate
    initialPrice: number, eg: 123.12 (required)
    startTime: number(seconds), eg: now number or zero (required)
    `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateClmm(
        new PublicKey(inputFormat.mint1),
        new PublicKey(inputFormat.mint2),

        new PublicKey(inputFormat.configId),

        new Decimal(inputFormat.initialPrice),
        new BN(inputFormat.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Raydium clmm pool created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRaydiumCreateCpmm extends Tool {
  name = "raydium_create_cpmm";
  description = `Raydium's newest CPMM, does not require marketID, supports Token 2022 standard
  
    Inputs (input is a json string):
    mint1: string (required)
    mint2: string (required)
    configId: string (required), stores pool info, index, protocolFeeRate, tradeFeeRate, fundFeeRate, createPoolFee
    mintAAmount: number(int), eg: 1111 (required)
    mintBAmount: number(int), eg: 2222 (required)
    startTime: number(seconds), eg: now number or zero (required)
    `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateCpmm(
        new PublicKey(inputFormat.mint1),
        new PublicKey(inputFormat.mint2),

        new PublicKey(inputFormat.configId),

        new BN(inputFormat.mintAAmount),
        new BN(inputFormat.mintBAmount),

        new BN(inputFormat.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Raydium cpmm pool created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaOpenbookCreateMarket extends Tool {
  name = "solana_openbook_create_market";
  description = `Openbook marketId, required for ammv4

  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)
  lotSize: number (required)
  tickSize: number (required)
  `;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.solanaKit.openbookCreateMarket(
        new PublicKey(inputFormat.baseMint),
        new PublicKey(inputFormat.quoteMint),

        inputFormat.lotSize,
        inputFormat.tickSize,
      );

      return JSON.stringify({
        status: "success",
        message: "Openbook market created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
