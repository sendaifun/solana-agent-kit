# Telegram Bot Starter with Solana Agent Kit

This example demonstrates how to create a Telegram bot using the Solana Agent Kit by Send AI. It includes advanced features such as:

- Storing chat history for each user in a PostgreSQL database.
- Maintaining a unique wallet for each user in a Firebase database.
- Managing the state of multiple users simultaneously, each with their own unique wallet.

This special bot can be run on Telegram groups and handle private conversations, such as wallet addresses, in private chats. It works in groups, maintains a separate context for each user, responds to each user by tagging them, and can handle multiple requests simultaneously. It will only reply if the bot is tagged in group or its message is replied to.

## Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsendaifun%2Fsolana-agent-kit%2Ftree%2Fmain%2Fexamples%2Ftg-bot-starter&env=OPENAI_API_KEY,RPC_URL,SOLANA_PRIVATE_KEY,TELEGRAM_BOT_TOKEN&project-name=solana-agent-kit&repository-name=sak-yourprojectname)

## How to get the telegram bot token

You can check [here](https://help.zoho.com/portal/en/kb/desk/support-channels/instant-messaging/telegram/articles/telegram-integration-with-zoho-desk#How_to_find_a_token_for_an_existing_Telegram_Bot) how you can obtain a bot token for your telegram bot.

## How to setup the project

- Set env variables
- Run ``` pnpm install ```
- Run ``` pnpm run dev ``` 
- Run ``` ngrok http 3000 ```
- With the URL you got from ngrok, where your bot is hosted at https://yourUrl.app/api/bot 
- Set the webhook by using this command ``` curl https://api.telegram.org/bot<telegram_bot_token>/setWebhook?url=https://<your-deployment-url>.app/api/bot ``` or simply clicking on that link.
- You can host it on Vercel too as we have used NextJs in this.
- Once the URL is set successfully, you will see this ``` {"ok":true,"result":true,"description":"Webhook was set"} ```

Done!!! Congratulations you just hosted Solana Agent Kit on a Telegram bot.

