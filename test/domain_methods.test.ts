
import { SolanaAgentKit } from "../src";
import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { expect } from "chai";
import { before, describe, it } from "node:test";
import { TldParser } from "@onsol/tldparser";

dotenv.config();

describe("Solana Domain Methods Tests", () => {
  let agent: SolanaAgentKit;

  before(() => {
    // Initialize the agent before running tests
    if (
      !process.env.SOLANA_PRIVATE_KEY ||
      !process.env.RPC_URL ||
      !process.env.OPENAI_API_KEY
    ) {
      throw new Error("Required environment variables are not set");
    }

    agent = new SolanaAgentKit(
      process.env.SOLANA_PRIVATE_KEY,
      process.env.RPC_URL,
      process.env.OPENAI_API_KEY
    );
  });

  describe("resolveAllDomains", () => {
    it("should resolve a valid domain to a public key", async () => {
      const testDomain = "hero.sol";
      const result = await agent.resolveAllDomains(testDomain);
      expect(result).to.be.instanceof(PublicKey);
    });
    it("should perform fetching of an owner an nft domain", async () => {
          const parser = new TldParser(agent.connection);
          const domanTld = "miester.sol";
          const ownerReceived = await parser.getOwnerFromDomainTld(domanTld);
          const owner = new PublicKey(
            "2EGGxj2qbNAJNgLCPKca8sxZYetyTjnoRspTPjzN2D67"
          );
          expect(ownerReceived).to.be(owner.toString());
    });
    it("should return null for non-existent domain", async () => {
      const nonExistentDomain = "nonexistent123456789.sol";
      const result = await agent.resolveAllDomains(nonExistentDomain);
      expect(result).to.be.null;
    });

    it("should handle invalid domain format", async () => {
      const invalidDomain = "";
      try {
        await agent.resolveAllDomains(invalidDomain);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.be.instanceof(Error);
      }
    });
  });

  describe("getOwnedAllDomains", () => {
    it("should return array of domains for an owner", async () => {
      const owner = new PublicKey(
        "2EGGxj2qbNAJNgLCPKca8sxZYetyTjnoRspTPjzN2D67"
      );
      const domains = await agent.getOwnedAllDomains(owner);
      expect(domains).to.be.an("array").that.includes("miester.sol");
      domains.forEach((domain) => {
        expect(domain).to.be.a("string");
      });
    });
    it("should return array of domains for an owner", async () => {
      const owner = new PublicKey(agent.wallet_address);
      const domains = await agent.getOwnedAllDomains(owner);
      expect(domains).to.be.an("array");
      domains.forEach((domain) => {
        expect(domain).to.be.a("string");
      });
    });

    it("should handle owner with no domains", async () => {
      // Create a new random public key that likely owns no domains
      const emptyOwner = PublicKey.unique();
      const domains = await agent.getOwnedAllDomains(emptyOwner);
      expect(domains).to.be.an("array");
      expect(domains).to.have.lengthOf(0);
    });
  });

  describe("getOwnedDomainsForTLD", () => { 
    it("should return domains for specific TLD", async () => {
      const tld = "sol";
      const domains = await agent.getOwnedDomainsForTLD(tld);
      expect(domains).to.be.an("array");
      domains.forEach((domain) => {
        console.log(`these are the domains ${domain.domain}`)
      });
    });

    it("should return empty array for non-existent TLD", async () => {
      const nonExistentTLD = "nonexistent";
      const domains = await agent.getOwnedDomainsForTLD(nonExistentTLD);
      expect(domains).to.be.an("array");
      expect(domains).to.have.lengthOf(0);
    });
  });

  describe("getAllDomainsTLDs", () => { 
    it("should return array of TLDs", async () => {
      const tlds = await agent.getAllDomainsTLDs();
      expect(tlds).to.be.an("array"); 
    });
  });

  describe("getAllRegisteredAllDomains", () => { 
    it("should return array of all registered domains", async () => {
      const domains = await agent.getAllRegisteredAllDomains();
      expect(domains).to.be.an("array");
      domains.forEach((domain) => {
        expect(domain).to.be.a("string");
        expect(domain).to.include(".");
      });
    });
  });

  describe("getMainAllDomainsDomain", () => { 
    it("should return main domain or null for an owner", async () => {
      const owner = new PublicKey(
            "2EGGxj2qbNAJNgLCPKca8sxZYetyTjnoRspTPjzN2D67"
      );
      const mainDomain = await agent.getMainAllDomainsDomain(owner);
      expect(mainDomain).to.satisfy((domain: string | null) => {
        return domain === null || typeof domain === "string";
      });
    });

    it("should return null for address without main domain", async () => {
      const emptyOwner = PublicKey.unique();
      const mainDomain = await agent.getMainAllDomainsDomain(emptyOwner);
      expect(mainDomain).to.be.null;
    });
  });
});

