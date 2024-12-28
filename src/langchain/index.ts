import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { Tool } from "langchain/tools";
import {
  GibworkCreateTaskReponse,
  PythFetchPriceResponse,
  SolanaAgentKit,
} from "../index";
import { create_image } from "../tools/create_image";
import { BN } from "@coral-xyz/anchor";
import { FEE_TIERS } from "../tools";
import { toJSON } from "../utils/toJSON";
import {
  Action,
  ActionExample,
  ActionResult,
  Handler,
  Validator,
} from "../types";
import {
  SolanaBalanceAction,
  SolanaCompressedAirdropAction,
  SolanaCreateGibworkTaskAction,
  SolanaCreateImageAction,
  SolanaCreateSingleSidedWhirlpoolAction,
  SolanaDeployCollectionAction,
  SolanaDeployTokenAction,
  SolanaFetchPriceAction,
  SolanaGetAllTldsAction,
  SolanaGetDomainAction,
  SolanaGetMainDomainAction,
  SolanaGetOwnedDomainsAction,
  SolanaGetOwnedTldDomainsAction,
  SolanaGetWalletAddressAction,
  SolanaLendAssetAction,
  SolanaMintNFTAction,
  SolanaOpenbookCreateMarketAction,
  SolanaPumpfunTokenLaunchAction,
  SolanaPythFetchPriceAction,
  SolanaRaydiumCreateAmmV4Action,
  SolanaRaydiumCreateClmmAction,
  SolanaRaydiumCreateCpmmAction,
  SolanaRegisterDomainAction,
  SolanaRequestFundsAction,
  SolanaResolveAllDomainsAction,
  SolanaResolveDomainAction,
  SolanaStakeAction,
  SolanaTokenDataAction,
  SolanaTokenDataByTickerAction,
  SolanaTPSCalculatorAction,
  SolanaTradeAction,
  SolanaTransferAction,
} from "../action";

export class SolanaBalanceTool extends Tool {
  private action = SolanaBalanceAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const tokenAddress = input ? new PublicKey(input) : undefined;
      const balance = await this.action.handler(this.solanaKit, {
        tokenAddress,
      });

      return JSON.stringify({
        status: "success",
        balance: balance,
        token: input || "SOL",
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

export class SolanaTransferTool extends Tool {
  private action = SolanaTransferAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        message: "Transfer completed successfully",
        ...result.data,
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

export class SolanaDeployTokenTool extends Tool {
  private action = SolanaDeployTokenAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaDeployCollectionTool extends Tool {
  private action = SolanaDeployCollectionAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaMintNFTTool extends Tool {
  private action = SolanaMintNFTAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaTradeTool extends Tool {
  private action = SolanaTradeAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaRequestFundsTool extends Tool {
  private action = SolanaRequestFundsAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaRegisterDomainTool extends Tool {
  private action = SolanaRegisterDomainAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaResolveDomainTool extends Tool {
  private action = SolanaResolveDomainAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaGetDomainTool extends Tool {
  private action = SolanaGetDomainAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaGetWalletAddressTool extends Tool {
  private action = SolanaGetWalletAddressAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      // No need to parse input for this action as it doesn't take any
      const result = await this.action.handler(this.solanaKit, {});

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaPumpfunTokenLaunchTool extends Tool {
  private action = SolanaPumpfunTokenLaunchAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaCreateImageTool extends Tool {
  private action = SolanaCreateImageAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      // Note: This action takes the raw string input as the prompt
      const result = await this.action.handler(this.solanaKit, {
        prompt: input.trim(),
      });

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaLendAssetTool extends Tool {
  private action = SolanaLendAssetAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaTPSCalculatorTool extends Tool {
  private action = SolanaTPSCalculatorAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const result = await this.action.handler(this.solanaKit, {});

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaStakeTool extends Tool {
  private action = SolanaStakeAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

/**
 * Tool to fetch the price of a token in USDC
 */

export class SolanaFetchPriceTool extends Tool {
  private action = SolanaFetchPriceAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaTokenDataTool extends Tool {
  private action = SolanaTokenDataAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaTokenDataByTickerTool extends Tool {
  private action = SolanaTokenDataByTickerAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaCompressedAirdropTool extends Tool {
  private action = SolanaCompressedAirdropAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaCreateSingleSidedWhirlpoolTool extends Tool {
  private action = SolanaCreateSingleSidedWhirlpoolAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaRaydiumCreateAmmV4 extends Tool {
  private action = SolanaRaydiumCreateAmmV4Action;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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
  private action = SolanaRaydiumCreateClmmAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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
  private action = SolanaRaydiumCreateCpmmAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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
  private action = SolanaOpenbookCreateMarketAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaPythFetchPrice extends Tool {
  private action = SolanaPythFetchPriceAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaResolveAllDomainsTool extends Tool {
  private action = SolanaResolveAllDomainsAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaGetOwnedDomains extends Tool {
  private action = SolanaGetOwnedDomainsAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaGetOwnedTldDomains extends Tool {
  private action = SolanaGetOwnedTldDomainsAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaGetAllTlds extends Tool {
  private action = SolanaGetAllTldsAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(_input: string): Promise<string> {
    try {
      // This action doesn't require any input
      const result = await this.action.handler(this.solanaKit, {});

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaGetMainDomain extends Tool {
  private action = SolanaGetMainDomainAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export class SolanaCreateGibworkTask extends Tool {
  private action = SolanaCreateGibworkTaskAction;
  name = this.action.name;
  similes = this.action.similes;
  description = this.action.description;
  examples = this.action.examples;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        ...result.data,
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

export function createSolanaTools(solanaKit: SolanaAgentKit) {
  return [
    new SolanaBalanceTool(solanaKit),
    new SolanaTransferTool(solanaKit),
    new SolanaDeployTokenTool(solanaKit),
    new SolanaDeployCollectionTool(solanaKit),
    new SolanaMintNFTTool(solanaKit),
    new SolanaTradeTool(solanaKit),
    new SolanaRequestFundsTool(solanaKit),
    new SolanaRegisterDomainTool(solanaKit),
    new SolanaGetWalletAddressTool(solanaKit),
    new SolanaPumpfunTokenLaunchTool(solanaKit),
    new SolanaCreateImageTool(solanaKit),
    new SolanaLendAssetTool(solanaKit),
    new SolanaTPSCalculatorTool(solanaKit),
    new SolanaStakeTool(solanaKit),
    new SolanaFetchPriceTool(solanaKit),
    new SolanaGetDomainTool(solanaKit),
    new SolanaTokenDataTool(solanaKit),
    new SolanaTokenDataByTickerTool(solanaKit),
    new SolanaCompressedAirdropTool(solanaKit),
    new SolanaRaydiumCreateAmmV4(solanaKit),
    new SolanaRaydiumCreateClmm(solanaKit),
    new SolanaRaydiumCreateCpmm(solanaKit),
    new SolanaOpenbookCreateMarket(solanaKit),
    new SolanaCreateSingleSidedWhirlpoolTool(solanaKit),
    new SolanaPythFetchPrice(solanaKit),
    new SolanaResolveDomainTool(solanaKit),
    new SolanaGetOwnedDomains(solanaKit),
    new SolanaGetOwnedTldDomains(solanaKit),
    new SolanaGetAllTlds(solanaKit),
    new SolanaGetMainDomain(solanaKit),
    new SolanaResolveAllDomainsTool(solanaKit),
    new SolanaCreateGibworkTask(solanaKit),
  ];
}
