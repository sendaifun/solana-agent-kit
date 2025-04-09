# n8n-nodes-solana-agent

This is an n8n community node for integrating the Solana Agent Kit with n8n workflows. It provides a seamless way to interact with the Solana blockchain using AI-powered tools.

## Features

- Token Operations
  - Create new tokens
  - Mint tokens
  - Transfer tokens
- NFT Operations
  - Deploy collections
  - Mint NFTs
  - List NFTs for sale
- DeFi Operations (Coming soon)
  - Swap tokens
  - Provide liquidity
  - Yield farming

## Installation

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/n8n-nodes-solana-agent
cd n8n-nodes-solana-agent
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link to your n8n installation:
```bash
npm link
cd ~/.n8n/nodes
npm link n8n-nodes-solana-agent
```

### Global Installation (via npm)

```bash
npm install -g n8n-nodes-solana-agent
```

## Usage

1. Configure Credentials:
   - Add your Solana private key
   - Set your preferred RPC URL
   - Add your OpenAI API key

2. Available Operations:

### Token Operations
- Create Token
  - Required fields:
    - Token Name
    - Token Symbol
  - Optional fields:
    - Decimals
    - Initial Supply

- Mint Token
  - Required fields:
    - Token Address
    - Amount
    - Recipient Address

### NFT Operations
- Deploy Collection
  - Required fields:
    - Collection Name
    - Collection Symbol
  - Optional fields:
    - Description
    - Base URI

- Mint NFT
  - Required fields:
    - Collection Address
    - NFT Name
    - NFT URI

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Test: `npm run test`
