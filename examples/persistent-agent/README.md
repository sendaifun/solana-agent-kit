# Persistent Agent with PostgreSQL

This example showcases a persistent agent that retains memory across sessions using a PostgreSQL database. It ensures that the agent can remember previous conversations even after being restarted, enhancing the user experience in applications requiring long-term context retention.
[Reference](https://langchain-ai.github.io/langgraphjs/reference/classes/checkpoint_postgres.PostgresSaver.html)

## Key Features

- **Persistent Memory**: The agent stores chat history in a PostgreSQL database, allowing it to remember past interactions across sessions.
- **Seamless Integration**: Designed to integrate smoothly with existing setups.
- **Scalable Solution**: Ideal for applications requiring long-term memory capabilities.

## Prerequisites

To use this feature, ensure you have the following:

1. **PostgreSQL Database URL**: Create and host ur PostgreSQL database and enter the URL. It will be of the format "postgresql://user:password@localhost:5432/db"

## Without persistence
```
You: Hi, My name is Arpit
Agent: Hello Arpit! How can I assist you today?
You: ^С
$ pnpm run dev
You: whats my name
Agent: I'm sorry, but I don't have access to personal data about users unless it's shared with me in the course of our conversation. If you tell me your name, I'll be happy to use it in our conversation!
```
## With persistence
```
You: i, My name is Arpit
Agent: Hello Arpit! How can I assist you today?
You: ^С
$ pnpm run dev
You: Do you know my name?
Agent: Yes, you just mentioned that your name is Arpit. How can I help you today?
```
