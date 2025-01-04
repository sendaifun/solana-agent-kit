# Discord Bot Starter Kit With Solana Agent Kit

This example showcases how to create a Discord bot using the Solana Agent Kit by Send AI.

### Discord Bot Token Setup
Follow [this guide](https://www.writebots.com/discord-bot-token/) to obtain your Discord bot token.

### Project Setup
1. Clone the repository
2. Rename `.env.example` to `.env`
3. Configure environment variables
4. Install dependencies:
    ```bash
    pnpm install
    ```
5. Start the development server:
    ```bash
    pnpm run dev
    ```
6. Set up ngrok for local development:
    ```bash
    ngrok http 3000
    ```
7. Register Discord Application Commands:
    - Navigate to the `scripts` folder
    - Install dependencies with `pnpm install`
    - Configure your environment variables
    - Run `pnpm register` to register the commands

8. Configure Discord Application:
    - Go to [Discord Developer Portal](https://discord.com/developers/applications/)
    - Select your application
    - Set the Interactions Endpoint URL to your ngrok URL or deployment URL
    - Example: `https://your-url/api/`

Note: You can also deploy this application on Vercel as it's built with Next.js.