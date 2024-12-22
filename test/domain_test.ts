import { SolanaAgentKit } from "../src";
import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { before, describe, it } from "node:test";
import assert from "assert";
import { TldParser } from "@onsol/tldparser";

dotenv.config();

describe("Solana Domain Methods Tests", () => {
  let agent: SolanaAgentKit;

  before(() => {
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
      assert.ok(result instanceof PublicKey, "Result should be an instance of PublicKey");
    });

    it("should fetch the owner of an NFT domain", async () => {
      const parser = new TldParser(agent.connection);
      const domainTld = "miester.sol";
      const ownerReceived = await parser.getOwnerFromDomainTld(domainTld);
      const owner = new PublicKey(
        "2EGGxj2qbNAJNgLCPKca8sxZYetyTjnoRspTPjzN2D67"
      );
      assert.strictEqual(ownerReceived, owner.toString(), "Owners should match");
    });

    it("should return null for a non-existent domain", async () => {
      const nonExistentDomain = "nonexistent123456789.sol";
      const result = await agent.resolveAllDomains(nonExistentDomain);
      assert.strictEqual(result, null, "Result should be null for a non-existent domain");
    });

    it("should handle invalid domain format", async () => {
      const invalidDomain = "";
      try {
        await agent.resolveAllDomains(invalidDomain);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.ok(error instanceof Error, "Error should be an instance of Error");
      }
    });
  });

  describe("getOwnedAllDomains", () => {
    it("should return an array of domains for an owner", async () => {
      const owner = new PublicKey(
        "2EGGxj2qbNAJNgLCPKca8sxZYetyTjnoRspTPjzN2D67"
      );
      const domains = await agent.getOwnedAllDomains(owner);
      assert.ok(Array.isArray(domains), "Result should be an array");
      assert.ok(domains.map((domain)=>domain.domain).includes("miester.sol"), "Result should include 'miester.sol'");
      domains.forEach((domain) => {
        assert.strictEqual(typeof domain, "string", "Each domain should be a string");
      });
    });

    it("should handle an owner with no domains", async () => {
      const emptyOwner = PublicKey.unique();
      const domains = await agent.getOwnedAllDomains(emptyOwner);
      assert.ok(Array.isArray(domains), "Result should be an array");
      assert.strictEqual(domains.length, 0, "Result should be an empty array");
    });
  });

  describe("getOwnedDomainsForTLD", () => {
    it("should return domains for a specific TLD", async () => {
      const tld = "sol";
      const domains = await agent.getOwnedDomainsForTLD(tld);
      assert.ok(Array.isArray(domains), "Result should be an array");
      domains.forEach((domain) => {
        console.log(`Domain: ${domain.domain}`);
        assert.strictEqual(typeof domain.domain, "string", "Domain should be a string");
      });
    });

    it("should return an empty array for a non-existent TLD", async () => {
      const nonExistentTLD = "nonexistent";
      const domains = await agent.getOwnedDomainsForTLD(nonExistentTLD);
      assert.ok(Array.isArray(domains), "Result should be an array");
      assert.strictEqual(domains.length, 0, "Result should be an empty array");
    });
  });

  describe("getAllDomainsTLDs", () => {
    it("should return an array of TLDs", async () => {
      const tlds = await agent.getAllDomainsTLDs();
      assert.ok(Array.isArray(tlds), "Result should be an array");
    });
  });

  describe("getAllRegisteredAllDomains", () => {
    it("should return an array of all registered domains", async () => {
      const domains = await agent.getAllRegisteredAllDomains();
      assert.ok(Array.isArray(domains), "Result should be an array");
      domains.forEach((domain) => {
        assert.strictEqual(typeof domain, "string", "Each domain should be a string");
        assert.ok(domain.domain.includes("."), "Each domain should include a dot");
      });
    });
  });

  describe("getMainAllDomainsDomain", () => {
    it("should return the main domain or null for an owner", async () => {
      const owner = new PublicKey(
        "2EGGxj2qbNAJNgLCPKca8sxZYetyTjnoRspTPjzN2D67"
      );
      const mainDomain = await agent.getMainAllDomainsDomain(owner);
      assert.ok(
        mainDomain === null || typeof mainDomain === "string",
        "Result should be null or a string"
      );
    });

    it("should return null for an address without a main domain", async () => {
      const emptyOwner = PublicKey.unique();
      const mainDomain = await agent.getMainAllDomainsDomain(emptyOwner);
      assert.strictEqual(mainDomain, null, "Result should be null");
    });
  });
});
