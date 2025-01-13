We have three guides on how you can host Solana Agent Kit as a Telegram bot:

1. **Basic TG Bot**: This guide explains how to run a simple Solana Agent Kit on a Telegram bot for a single user.

2. **Advanced TG Bot**: This guide includes advanced features such as:
    - Storing chat history for each user in a PostgreSQL database.
    - Maintaining a unique wallet for each user in a Firebase database.
    - Managing the chats of multiple users simultaneously.

3. **Group TG Bot**: This example demonstrates how to create a Telegram bot using the Solana Agent Kit by Send AI. It includes advanced features such as:
    - Storing chat history for each user in a PostgreSQL database.
    - Maintaining a unique wallet for each user in a Firebase database.
    - This special bot can be run in Telegram groups and handle private conversations, such as wallet addresses, in private chats. It works in groups, maintains a separate context for each user, responds to each user by tagging them, and can handle multiple requests simultaneously. It will only reply if the bot is tagged in the group or its message is replied to.