# Wormhole NextJS Agent

This is a Next.js application that demonstrates the use of the Solana Agent Kit to create a Wormhole agent for cross-chain operations. The agent provides a chat interface for interacting with Wormhole's cross-chain messaging protocol, allowing users to perform token transfers and CCTP (Cross-Chain Transfer Protocol) operations seamlessly.

## Features

- **Interactive Chat Interface**: User-friendly chat UI for interacting with the Wormhole agent
- **Cross-Chain Operations**:
  - Token transfers between supported blockchains
  - CCTP transfers for USDC between supported chains
  - Chain information retrieval
- **Real-Time Transaction Tracking**: Visual feedback for transaction status and completion
- **Transaction History**: View details of completed transactions including source and destination transactions
- **Responsive Design**: Works on desktop and mobile devices with dark mode support
- **Real-Time Logs**: Debug panel showing agent operations in real-time

## Cross-Chain Operations Supported

The agent supports the following operations:

1. **Token Transfers**: Transfer tokens between different blockchains using Wormhole's token bridge
2. **CCTP Transfers**: Transfer USDC between chains using Circle's Cross-Chain Transfer Protocol
3. **Chain Information**: Get information about supported chains and their addresses

## UI Components

The application includes custom UI components for displaying different types of operations:

- **Token Transfer UI**: Green-themed interface showing token transfer details
- **CCTP Transfer UI**: Purple-themed interface showing CCTP transfer details
- **Supported Chains UI**: Grid display of supported chains grouped by network

## Getting Started

First, set up your environment variables:

1. Copy `.example.env` to `.env.local`
2. Fill in the required API keys and configuration values

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage Examples

Here are some example commands you can try with the agent:

- "What chains do you support?"
- "Transfer 0.01 SOL from Solana to Sui"
- "Send 1 USDC from Solana to Base Sepolia using CCTP"
- "What is Wormhole?"

## Technologies Used

- **Next.js**: React framework for the frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Solana Agent Kit**: Framework for building blockchain agents
- **Wormhole SDK**: For cross-chain operations

## Brand Guidelines

This project follows the Wormhole brand guidelines with the following color palette:

- **Black**: #000000 (CMYK: 0/0/0/100, RGB: 0/0/0)
- **White**: #FFFFFF (CMYK: 0/0/0/0, RGB: 255/255/255)
- **Plum**: #C1BBF6 (CMYK: 22/24/0/4, RGB: 193/187/246)
- **Yellow**: #DDE95A (CMYK: 5/0/61/9, RGB: 221/233/90)
- **Coral**: #FD8058 (CMYK: 0/62/67/0, RGB: 253/128/88)

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/components`: React components including:
  - `MessageBubble.tsx`: Handles rendering of different message types
  - `ChatInput.tsx`: User input component
  - `LogsPanel.tsx`: Debug logs display
- `/public`: Static assets including brand icons

## License

This project is licensed under the MIT License.

## Learn More

- [Wormhole Documentation](https://docs.wormhole.com/wormhole/) - Learn about Wormhole's cross-chain messaging protocol
- [Circle CCTP Documentation](https://developers.circle.com/stablecoins/docs/cctp-getting-started) - Learn about Circle's Cross-Chain Transfer Protocol
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Solana Agent Kit](https://github.com/solana-labs/solana-agent-kit) - Framework for building blockchain agents

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
