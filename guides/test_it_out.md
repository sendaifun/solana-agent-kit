# How to Test It Out

Testing the **Solana Agent Kit** ensures that all functionalities are working as expected. You can run automated tests or interact with the agent in different modes to verify its operations.

## Running Automated Tests

The project includes a test script located at `test/index.ts`. To execute the tests:

1. **Ensure Dependencies are Installed**
   - If you haven't installed the dependencies yet, refer to the [Setup Locally](./setup_locally.md) guide.

2. **Run the Test Script**
   ```bash
   pnpm run test
   ```
   This will run the `test/index.ts` script using `tsx`. Ensure that your environment variables are correctly set in the `.env` file before running the tests.

## Interactive Modes

### Available Modes
1. **Chat Mode**
   - Allows you to interact with the agent in a conversational manner.

2. **Autonomous Mode**
   - Enables the agent to perform actions on the blockchain autonomously at regular intervals.

### Starting the Agent

1. **Launch the Agent**
   ```bash
   pnpm start
   ```

2. **Select Your Mode**
   - For Chat Mode: Enter `1` or `chat`
   - For Autonomous Mode: Enter `2` or `auto`

### Using Each Mode

#### Chat Mode
- Start chatting by entering prompts after the `Prompt:` indicator
- Type `exit` to end the chat session

#### Autonomous Mode
- The agent executes predefined actions every 10 seconds
- Actions and outputs are displayed in the console

## Code Examples

### Token Deployment
```typescript
import { SolanaAgentKit } from "solana-agent-kit";

const agent = new SolanaAgentKit("your_private_key");

const result = await agent.deployToken(
  9, // decimals
);

console.log("Token Mint Address:", result.mint.toString());
```

### NFT Collection Creation
```typescript
import { SolanaAgentKit } from "solana-agent-kit";

const agent = new SolanaAgentKit("your_private_key");

const collection = await agent.deployCollection({
  name: "My NFT Collection",
  uri: "https://arweave.net/metadata.json",
  royaltyBasisPoints: 500,  // 5%
  creators: [
    {
      address: "creator-wallet-address",
      percentage: 100,
    },
  ],
});
```

## Best Practices

### Environment Setup
- Verify `.env` file contains correct and secure values
- Ensure all required environment variables are set

### Testing
- Maintain comprehensive test coverage
- Monitor console logs during testing
- Clean up test assets after deployment

## Troubleshooting

### Test Failures

#### Missing Environment Variables
- **Issue:** Tests fail due to missing environment variables
- **Solution:** Check `.env` file for all required variables

#### Network Problems
- **Issue:** Network-related errors
- **Solution:** Verify internet connection and Solana RPC endpoint accessibility

### Agent Issues

#### Startup Problems
- **Issue:** Agent doesn't prompt for mode selection
- **Solution:** Verify successful build and dependency installation 