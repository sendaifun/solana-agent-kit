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
Available modes:
1. chat
- Interactive chat mode
2. auto
- Autonomous action mode
Choose a mode (enter number or name: 1
Starting chat mode... Type 'exit' to end.
Prompt: i am arpit
Hello Arpit! How can I assist you today?
Prompt: ^С
$ ts-node index.ts
Starting Agent...
Available modes:
1. chat
- Interactive chat mode
2. auto
- Autonomous action mode
Choose a mode (enter number or name): 1
Starting chat mode... Type 'exit' to end.
Prompt: do u know my name
I don't know your name yet. If you'd like, you can share it.
```
## With persistence
```
Available modes:
1. chat
- Interactive chat mode
2. auto
- Autonomous action mode
Choose a mode (enter number or name: 1
Starting chat mode... Type 'exit' to end.
Prompt: i am arpit
Hello Arpit! How can I assist you today?
Prompt: ^С
$ ts-node index.ts
Starting Agent...
Available modes:
1. chat
- Interactive chat mode
2. auto
- Autonomous action mode
Choose a mode (enter number or name): 1
Starting chat mode... Type 'exit' to end.
Prompt: do u know my name
Yes, you mentioned that your name is Arpit. How can I help you today? 
```

