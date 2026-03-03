---
"@solana-agent-kit/plugin-defi": patch
---

Fix jito-ts dependency conflict by adding overrides for @solana/web3.js

Resolves #466 - npm installs were failing because jito-ts bundles an old
@solana/web3.js@1.77.4 that expects an incompatible rpc-websockets file structure.

The overrides force jito-ts and @drift-labs/sdk to use web3.js@1.95.0+,
which is compatible with modern rpc-websockets (v7.11+).
