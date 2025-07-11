[**Documentation v2**](../../README.md)

***

[Documentation](../../README.md) / @solana-agent-kit/plugin-misc

# @solana-agent-kit/plugin-misc

This plugin provides a set of miscellaneous tools and actions for interacting with various services and protocols on the Solana blockchain. It includes functionalities for domain registration, webhook creation, and more.

## Tools Available

### AllDomains
- `getAllDomainsTLDs` - Retrieve all top-level domains.
- `getOwnedAllDomains` - Get all domains owned by a specific wallet.
- `getOwnedDomainsForTLD` - Get domains owned by a wallet for a specific TLD.
- `resolveDomain` - Resolve a domain to get its owner's public key.

### Allora
- `getAllTopics` - Retrieve all topics.
- `getInferenceByTopicId` - Get inference data by topic ID.
- `getPriceInference` - Get price inference data.

### Gibwork
- `createGibworkTask` - Create a new task on Gibwork.

### Helius
- `createWebhook` - Create a new webhook to monitor transactions.
- `deleteWebhook` - Delete an existing webhook.
- `getAssetsByOwner` - Get assets owned by a specific wallet.
- `getWebhook` - Retrieve webhook details.
- `parseTransaction` - Parse a Solana transaction.

### SNS
- `resolveSolDomain` - Resolve a .sol domain.
- `registerDomain` - Register a new .sol domain.
- `getPrimaryDomain` - Get the primary domain for a wallet.
- `getMainAllDomainsDomain` - Get the main domain for AllDomains.
- `getAllRegisteredAllDomains` - Get all registered domains.

### Squads
- `transferFromMultisigTreasury` - Transfer funds from a multisig treasury.
- `rejectMultisigProposal` - Reject a multisig proposal.
- `executeMultisigProposal` - Execute a multisig proposal.
- `depositToMultisigTreasury` - Deposit funds into a multisig treasury.
- `createMultisig` - Create a new multisig account.
- `createMultisigProposal` - Create a new multisig proposal.

### Coingecko
- `getCoingeckoTokenInfo` - Get token information from Coingecko.
- `getCoingeckoTopGainers` - Get top gaining tokens.
- `getCoingeckoLatestPools` - Get the latest pools.
- `getCoingeckoTrendingPools` - Get trending pools.
- `getCoingeckoTokenPriceData` - Get token price data.
- `getCoingeckoTrendingTokens` - Get trending tokens.

### ElfaAi
- `getElfaAiApiKeyStatus` - Check the status of an ElfaAi API key.
- `getSmartMentions` - Get smart mentions using ElfaAi.
- `getSmartTwitterAccountStats` - Get Twitter account stats using ElfaAi.
- `getTopMentionsByTicker` - Get top mentions by ticker using ElfaAi.
- `getTrendingTokensUsingElfaAi` - Get trending tokens using ElfaAi.
- `pingElfaAiApi` - Ping the ElfaAi API.
- `searchMentionsByKeywords` - Search mentions by keywords using ElfaAi.

## Switchboard
- `simulate_switchboard_feed` - Simulate a switchboard feed.

### HomoMemetus
- `fetch_oldest_tokens` - Fetch oldest token list in token list created in 24h
- `fetch_recent_tokens` - Fetch recent token list in token list created in 24h
- `fetch_token_by_creator` - Fetch tokens filter with created by a specific creator
- `fetch_token_by_initializer` - Filter tokens initialized by a specific address
- `fetch_token_by_mint` - Filter by a specific token address
- `fetch_token_by_signature` - Filter by a specific transaction signature
- `fetch_tokens_by_creators` - Filter tokens created by a specific creator address list
- `fetch_tokens_by_initializers` - Filter tokens initialized by a specific address list
- `fetch_tokens_by_duration` - Filter token list by creation time
- `fetch_tokens_by_market_cap` - Filter token list by token market cap
- `fetch_tokens_by_metadata` - Filter token list by token metadata
- `fetch_tokens_by_mints` - Filter token list by mint address list

### OtterSec
- `create_verification_pda` - Generate a PDA for program verification
- `decode_verification_pda_data` - Decode the PDA data composed in hex
- `get_program_build_log` - Get build logs for a solana program 
- `get_program_verification_status` - Get program verification status
- `get_verification_job_status` - Get status of an async verification job
- `get_verified_programs` - Get list of all verified programs
- `verify_program` - Verify a Solana program

## Example Usage

### Register a Domain
```typescript
const result = await agent.methods.registerDomain(agent, {
  name: "mydomain",
  spaceKB: 1,
});
console.log("Domain Registration:", result);
```

### Create a Webhook
```typescript
const webhook = await agent.methods.createWebhook(agent, {
  accountAddresses: ["BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP"],
  webhookURL: "https://yourdomain.com/webhook",
});
console.log("Webhook Created:", webhook);
```

For more detailed information about each action and its parameters, you can check the individual action files in the source code or refer to the official documentation at [docs.sendai.fun](https://docs.sendai.fun).

## Variables

- [default](variables/default.md)
