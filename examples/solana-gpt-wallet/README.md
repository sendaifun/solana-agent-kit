# Solana GPT Wallet

A modern, AI-powered wallet interface for Solana that allows users to interact with their crypto assets using natural language. Built with Next.js, Tailwind CSS, and integrated with GPT for an intuitive user experience.

🔗 **Live Demo**: [https://solana-gpt-wallet.vercel.app/](https://solana-gpt-wallet.vercel.app/)

> ⚡ Please be mindful of GPT API usage if testing the live demo.

## 💡 Inspiration

This project was inspired by [@thearyanag](https://github.com/thearyanag)'s ideas and [this discussion](https://github.com/sendaifun/solana-agent-kit/issues/126) about Solana Agent Kit. The goal is to create a more intuitive way to interact with Solana wallets using natural language.

## 🎯 Implementation Details

- Currently using GPT-4o-mini for processing natural language commands (feel free to experiment with different models)
- Using default Solana wallet provider for transaction signing
- Future possibilities (not yet implemented):
    - Using Privy for auto-signing transactions
    - Generating unique wallets for each user mapped to their EOA
- Automated features:
    - Integrated 2 SOL airdrop for testing
    - Real-time balance updates
    - Transaction history tracking

## ⚠️ Known Limitations

- **Swap Functionality**: Currently, the swap feature is not fully functional due to Jupiter API limitations on Devnet. Contributions to fix this are welcome!
- Running on Devnet for testing purposes.
- Current model (GPT-4o-mini) limitations - feel free to experiment with other models like GPT-o1 or Claude 3.5 Sonnet.

## ✨ Features

- **Natural Language Interactions** - Send tokens, check balances, and perform actions using simple text commands
- **Token Management** - View SOL and USDC balances in real-time
- **Transaction History** - Track your recent transactions with detailed status updates
- **AI-Powered Interface** - Interact with your wallet using natural language
- **Automated Test SOL** - One-click 2 SOL airdrop for testing
- **Secure Architecture** - Built with security best practices and proper error handling
- **Mobile Responsive** - Fully functional on both desktop and mobile devices

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/pegasus1134/solana-gpt-wallet.git
cd solana-gpt-wallet
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

## 🔧 Customization

Feel free to experiment with:
- Different GPT models (currently using GPT-4o-mini)
- Custom system prompts for better interactions
- Alternative wallet providers
- Additional token support

## 🛠 Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Blockchain**: Solana Web3.js
- **AI Integration**: OpenAI GPT-4o-mini
- **State Management**: Zustand

## 🤝 Contributing

Contributions are welcome! Particularly interested in:
- Fixing the swap functionality
- Implementing Privy integration
- Adding support for more tokens
- Improving error handling
- Enhancing the UI/UX

To contribute:
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes

## 👏 Acknowledgements

- [@thearyanag](https://github.com/thearyanag) for the original idea and inspiration
- [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit)
- Solana and OpenAI teams for their amazing tools

---

Made by [pegasus1134](https://github.com/pegasus1134) | neuralway.ai
