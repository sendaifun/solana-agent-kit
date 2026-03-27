# @solana-agent-kit/plugin-messaging

Deside messaging plugin for Solana Agent Kit.

This plugin adds wallet-native messaging, identity, and discovery actions via
Deside MCP, backed by `@desideapp/mcp-sdk`.

## Methods

- `sendMessage`
- `readMessages`
- `markRead`
- `listConversations`
- `getUserInfo`
- `getMyIdentity`
- `searchAgents`

## Required config

- `DESIDE_OAUTH_REDIRECT_URI`

## Optional config

- `DESIDE_MCP_BASE_URL`
- `DESIDE_OAUTH_SCOPE`
- `DESIDE_OAUTH_CLIENT_NAME`
