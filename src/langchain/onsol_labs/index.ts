import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { PublicKey } from "@solana/web3.js";

export class SolanaResolveAllDomainsTool extends Tool {
  name = "solana_resolve_all_domains";
  description = `Resolve domain names to a public key for ALL domain types EXCEPT .sol domains.
    Use this for domains like .blink, .bonk, etc.
    DO NOT use this for .sol domains (use solana_resolve_domain instead).
  
    Input:
    domain: string, eg "mydomain.blink" or "mydomain.bonk" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const owner = await this.solanaKit.resolveAllDomains(input);

      if (!owner) {
        return JSON.stringify({
          status: "error",
          message: "Domain not found",
          code: "DOMAIN_NOT_FOUND",
        });
      }

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        owner: owner?.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DOMAIN_RESOLUTION_ERROR",
      });
    }
  }
}

export class SolanaGetOwnedDomains extends Tool {
  name = "solana_get_owned_domains";
  description = `Get all domains owned by a specific wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const domains = await this.solanaKit.getOwnedAllDomains(ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Owned domains fetched successfully",
        domains,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_OWNED_DOMAINS_ERROR",
      });
    }
  }
}

export class SolanaGetOwnedTldDomains extends Tool {
  name = "solana_get_owned_tld_domains";
  description = `Get all domains owned by the agent's wallet for a specific TLD.

  Inputs:
  tld: string, eg "bonk" (required)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const domains = await this.solanaKit.getOwnedDomainsForTLD(input);

      return JSON.stringify({
        status: "success",
        message: "TLD domains fetched successfully",
        domains,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLD_DOMAINS_ERROR",
      });
    }
  }
}

export class SolanaGetAllTlds extends Tool {
  name = "solana_get_all_tlds";
  description = `Get all active top-level domains (TLDs) in the AllDomains Name Service`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const tlds = await this.solanaKit.getAllDomainsTLDs();

      return JSON.stringify({
        status: "success",
        message: "TLDs fetched successfully",
        tlds,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLDS_ERROR",
      });
    }
  }
}
