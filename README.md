<div align="center">

# Solana Agent Kit

</div>

![Solana Agent Kit Cover 1 (3)](https://github.com/user-attachments/assets/cfa380f6-79d9-474d-9852-3e1976c6de70)

An open-source toolkit for connecting AI agents to Solana protocols. Now, any agent, using any model can autonomously perform 15+ Solana actions:

- Trade tokens
- Launch new tokens 
- Lend assets
- Send compressed airdrops
- Execute blinks
- Launch tokens on AMMs
- And more...

Anyone - whether an SF-based AI researcher or a crypto-native builder - can bring their AI agents trained with any model and seamlessly integrate with Solana.

## 🔧 Core Blockchain Features

- **Token Operations**
  - Deploy SPL tokens by Metaplex
  - Transfer assets
  - Balance checks
  - Stake SOL
  - Zk compressed Airdrop by Light Protocol and Helius

- **NFT Management via Metaplex**
  - Collection deployment
  - NFT minting
  - Metadata management
  - Royalty configuration

- **DeFi Integration**
  - Jupiter Exchange swaps
  - Launch on Pump via PumpPortal
  - Raydium pool creation (CPMM, CLMM, AMMv4)
  - Orca whirlpool integration
  - Meteora Dynamic AMM, DLMM Pool, and Alpga Vault
  - Openbook market creation
  - Register and Resolve SNS
  - Jito Bundles

- **Solana Blinks**
   - Lending by Lulo
   - Send Arcade Games
   - JupSOL staking


## 🤖 AI Integration Features

- **LangChain Integration**
  - Ready-to-use LangChain tools for blockchain operations
  - Autonomous agent support with React framework
  - Memory management for persistent interactions
  - Streaming responses for real-time feedback

- **Autonomous Modes**
  - Interactive chat mode for guided operations
  - Autonomous mode for independent agent actions
  - Configurable action intervals
  - Built-in error handling and recovery

- **AI Tools**
  - DALL-E integration for NFT artwork generation
  - Natural language processing for blockchain commands
  - Price feed integration for market analysis
  - Automated decision-making capabilities

## 📦 Installation

```bash
npm install solana-agent-kit
```

## Quick Start

```typescript
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";

// Initialize with private key and optional RPC URL
const agent = new SolanaAgentKit(
  "your-wallet-private-key-as-base58",
  "https://api.mainnet-beta.solana.com",
  "your-openai-api-key"
);

// Create LangChain tools
const tools = createSolanaTools(agent);
```

## Usage Examples

### Deploy a New Token

```typescript
import { deploy_token } from "solana-agent-kit";

const result = await deploy_token(
  agent,
  9, // decimals
  1000000 // initial supply
);

console.log("Token Mint Address:", result.mint.toString());
```

### Create NFT Collection

```typescript
import { deploy_collection } from "solana-agent-kit";

const collection = await deploy_collection(agent, {
  name: "My NFT Collection",
  uri: "https://arweave.net/metadata.json",
  royaltyBasisPoints: 500, // 5%
  creators: [
    {
      address: "creator-wallet-address",
      percentage: 100,
    },
  ],
});
```

### Swap Tokens

```typescript
import { trade } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";

const signature = await trade(
  agent,
  new PublicKey("target-token-mint"),
  100, // amount
  new PublicKey("source-token-mint"),
  300 // 3% slippage
);
```

### Lend Tokens

```typescript
import { lendAsset } from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";

const signature = await lendAsset(
  agent,
  100 // amount
);
```

### Stake SOL

```typescript
import { stakeWithJup } from "solana-agent-kit";

const signature = await stakeWithJup(
  agent,
  1 // amount in SOL
);
```

### Fetch Token Price

```typescript
import { fetchPrice } from "solana-agent-kit";

const price = await fetchPrice(
  agent,
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" // Token mint address
);

console.log("Price in USDC:", price);
```

### Send an SPL Token Airdrop via ZK Compression

```typescript
import {
  sendCompressedAirdrop,
  getAirdropCostEstimate,
} from "solana-agent-kit";
import { PublicKey } from "@solana/web3.js";

(async () => {
  console.log(
    "~Airdrop cost estimate:",
    getAirdropCostEstimate(
      1000, // recipients
      30_000 // priority fee in lamports
    )
  );

  const signature = await sendCompressedAirdrop(
    agent,
    new PublicKey("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"), // mint
    42, // amount per recipient
    [
      new PublicKey("1nc1nerator11111111111111111111111111111111"),
      // ... add more recipients
    ],
    30_000 // priority fee in lamports
  );
})();
```

## API Reference

### Core Functions

#### `deploy_token(agent, decimals?, name, uri, symbol, initialSupply?)`

Deploy a new SPL token with optional initial supply. If not specified, decimals default to 9.

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

#### `sendCompressedAirdrop(agent, mintAddress, amount, recipients, priorityFeeInLamports?, shouldLog?)`

Send an SPL token airdrop to many recipients at low cost via ZK Compression.

## Dependencies

The toolkit relies on several key Solana and Metaplex libraries:

- @solana/web3.js
- @solana/spl-token
- @metaplex-foundation/mpl-token-metadata
- @metaplex-foundation/mpl-core
- @metaplex-foundation/umi
- @lightprotocol/compressed-token
- @lightprotocol/stateless.js

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## License

MIT License

## Security

This toolkit handles private keys and transactions. Always ensure you're using it in a secure environment and never share your private keys.
