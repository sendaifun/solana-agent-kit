---
'@solana-agent-kit/plugin-defi': patch
---

Add documentation for npm compatibility issue (#466)

The plugin-defi package has transitive dependencies that can cause
rpc-websockets resolution errors when using npm instead of pnpm.

Added documentation explaining the issue and providing workarounds
for users installing via npm.
