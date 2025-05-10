<div align="center">
  
# Para Plugin Example

This repository demonstrates how to integrate and use Solana Agent Kit v2 with Para plugins in your application.

https://github.com/user-attachments/assets/e4f6b64a-4829-4528-bd83-bee1c8db6cce

</div>

## 🚀 Features

- Integration of [solana-plugin-para](https://github.com/uratmangun/solana-plugin-para) a third party plugin for solana-agent-kit for backend and frontend respectively
- Complete example of Para wallet management
- Real-world usage patterns and best practices

## 📦 Prerequisites

- Node.js 16.x or higher
- pnpm or bun package manager
- Solana development environment

## 🛠️ Installation

```bash
pnpm install --ignore-workspace
```

3. Copy the environment variables:
```bash

cp .env.example .env
```

4. Update the `.env` file with your credentials:
```env
LANGCHAIN_CALLBACKS_BACKGROUND=false
OPENAI_API_KEY=#<use groq api https://console.groq.com/docs/openai>
RPC_URL=
SOLANA_PRIVATE_KEY=
PARA_API_KEY=
PARA_ENV=BETA | PROD
NEXT_PUBLIC_PARA_ENV=BETA | PROD
NEXT_PUBLIC_PARA_API_KEY=
```

## 🏃‍♂️ Running the Example

1. Start the development server:
```bash
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📚 Implementation Details

### Server-Side Integration

```typescript
import { SolanaAgentKit } from "solana-agent-kit";
import ParaServerPlugin from "solana-plugin-para-server";

const solanaAgent = new SolanaAgentKit(/* config */);
export const solanaAgentWithPara = solanaAgent.use(ParaServerPlugin);
```

### Web Integration

```typescript
import ParaWebPlugin from "solana-plugin-para-web";
import { solanaAgent } from "./solana";

export const solanaAgentWithPara = solanaAgent.use(ParaWebPlugin);
export const para = solanaAgentWithPara.methods.getParaInstance();
```

## 🔑 Key Components

- `app/api/*` - API routes for Para operations
- `utils/*` - Utility functions and configurations
- `components/*` - React components for the UI
- `public/*` - Static assets

## 📖 Documentation

For more detailed information about the plugins, visit:
- [Para Documentation](https://docs.getpara.com/integration-guides/solana)
- [Solana Agent Kit v2 Documentation](https://github.com/sendaifun/solana-agent-kit/tree/v2)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
