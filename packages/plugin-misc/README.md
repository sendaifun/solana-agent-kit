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

### Alchemy
These tools are additive to the existing Helius and RPC provider integrations and do not include DAS/NFT asset tools.

- `alchemySolanaRpcRequest` - Call Solana JSON-RPC through Alchemy.
- `alchemyGetPriorityFeeEstimate` - Fetch Solana priority fee estimates through Alchemy.
- `alchemyGetTokenPricesBySymbol` - Fetch current token prices by symbol.
- `alchemyGetTokenPricesByAddress` - Fetch current token prices by network and token address.
- `alchemyGetHistoricalTokenPrices` - Fetch historical token prices.
- `alchemyGetPortfolioTokens` - Fetch wallet token balances, metadata, and prices.
- `alchemyCreateAddressActivityWebhook` - Create a Solana Address Activity webhook.
- `alchemyDeleteWebhook` - Delete an Alchemy Notify webhook.
- `alchemyListWebhooks` - List team webhooks.
- `alchemyUpdateWebhookAddresses` - Add or remove addresses from an Address Activity webhook.
- `alchemyReplaceWebhookAddresses` - Replace the full address list for an Address Activity webhook.
- `alchemyVerifyWebhookSignature` - Verify Alchemy webhook signatures.
- `getAlchemySolanaEndpointInfo` - Get RPC, WebSocket, gRPC, and x402 reference endpoint templates.

### Messari
- `askMessariAi` - Ask a question to Messari AI.

### SNS
- `resolveSolDomain` - Resolve a .sol domain.
- `registerDomain` - Register a new .sol domain.
- `getPrimaryDomain` - Get the primary domain for a wallet.
- `getMainAllDomainsDomain` - Get the main domain for AllDomains.
- `getAllRegisteredAllDomains` - Get all registered domains.

### SolanaFM
- `parseAccount` - Parse a Solana account.
- `parseInstruction` - Parse a Solana instruction.

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
