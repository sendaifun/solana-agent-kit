# Solana Agent Kit

A powerful toolkit for interacting with the Solana blockchain, providing easy-to-use functions for token operations, NFT management, and trading. Now integrated with LangChain for enhanced functionality.

## Features

- 🪙 Token Operations
  - Deploy new SPL tokens
  - Transfer SOL and SPL tokens
  - Check token balances
  - Stake SOL

- 🖼️ NFT Management
  - Deploy NFT collections
  - Mint NFTs to collections
  - Manage metadata and royalties

- 💱 Trading
  - Integrated Jupiter Exchange support
  - Token swaps with customizable slippage
  - Direct routing options

- 🏦 Yield Farming
  - Lend idle assets to earn interest with Lulo

- 🔗 LangChain Integration
  - Utilize LangChain tools for enhanced blockchain interactions
  - Access a suite of tools for balance checks, transfers, token deployments, and more

## Installation

```bash
npm install solana-agent-kit
```

## Quick Start

```typescript
import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';

// Initialize with private key and optional RPC URL
const agent = new SolanaAgentKit(
  'your-private-key',
  'https://api.mainnet-beta.solana.com'
);

// Create LangChain tools
const tools = createSolanaTools(agent);
```

## Usage Examples

### Deploy a New Token

```typescript
import { deploy_token } from 'solana-agent-kit';

const result = await deploy_token(
  agent,
  9, // decimals
  1000000 // initial supply
);

console.log('Token Mint Address:', result.mint.toString());
```

### Create NFT Collection

```typescript
import { deploy_collection } from 'solana-agent-kit';

const collection = await deploy_collection(agent, {
  name: "My NFT Collection",
  uri: "https://arweave.net/metadata.json",
  royaltyBasisPoints: 500, // 5%
  creators: [
    {
      address: "creator-wallet-address",
      percentage: 100
    }
  ]
});
```

### Swap Tokens

```typescript
import { trade } from 'solana-agent-kit';
import { PublicKey } from '@solana/web3.js';

const signature = await trade(
  agent,
  new PublicKey('target-token-mint'),
  100, // amount
  new PublicKey('source-token-mint'),
  300 // 3% slippage
);
```

### Lend Tokens

```typescript
import { lendAsset } from 'solana-agent-kit';
import { PublicKey } from '@solana/web3.js';

const signature = await lendAsset(
  agent,
  new PublicKey('asset-mint'),
  100, // amount
  "lulo-api-key"
);
```

### Stake SOL

```typescript
import { stakeWithJup } from 'solana-agent-kit';

const signature = await stakeWithJup(
  agent,
  1 // amount in SOL
);
```

## API Reference

### Core Functions

#### `deploy_token(agent, decimals?, initialSupply?)`
Deploy a new SPL token with optional initial supply.

#### `deploy_collection(agent, options)`
Create a new NFT collection with customizable metadata and royalties.

#### `mintCollectionNFT(agent, collectionMint, metadata, recipient?)`
Mint a new NFT as part of an existing collection.

#### `transfer(agent, to, amount, mint?)`
Transfer SOL or SPL tokens to a recipient.

#### `trade(agent, outputMint, inputAmount, inputMint?, slippageBps?)`
Swap tokens using Jupiter Exchange integration.

#### `get_balance(agent, token_address)`
Check SOL or token balance for the agent's wallet.

#### `lendAsset(agent, assetMint, amount, apiKey)`
Lend idle assets to earn interest with Lulo.

#### `stakeWithJup(agent, amount)`
Stake SOL with Jupiter to earn rewards.

## Dependencies

The toolkit relies on several key Solana and Metaplex libraries:

- @solana/web3.js
- @solana/spl-token
- @metaplex-foundation/mpl-token-metadata
- @metaplex-foundation/umi

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License

## Security

This toolkit handles private keys and transactions. Always ensure you're using it in a secure environment and never share your private keys.
