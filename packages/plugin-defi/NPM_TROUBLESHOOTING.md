# NPM Troubleshooting Guide

## Issue #466: jito-ts dependency conflict with rpc-websockets

### Problem
When installing `@solana-agent-kit/plugin-defi` using npm (instead of pnpm), you may encounter the following error:

```
Error: Cannot find module 'rpc-websockets/dist/lib/client'
```

This occurs because the plugin's dependency chain includes `jito-ts` which bundles an outdated version of `@solana/web3.js` (v1.77.4). This old version expects an old file structure from `rpc-websockets` that no longer exists in modern versions (v7.11+).

### Dependency Chain
```
@solana-agent-kit/plugin-defi
  → @drift-labs/sdk
    → @pythnetwork/pyth-solana-receiver
      → @pythnetwork/solana-utils
        → jito-ts (bundles @solana/web3.js@1.77.4)
```

### Solutions

#### Solution 1: Use pnpm (Recommended)
This repository uses pnpm which handles dependency resolution better:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Use pnpm for installation
pnpm install solana-agent-kit @solana-agent-kit/plugin-defi
```

#### Solution 2: Add npm overrides
Add the following to your project's `package.json`:

```json
{
  "overrides": {
    "rpc-websockets": "^10.0.0",
    "jito-ts": {
      "@solana/web3.js": "^1.98.2"
    }
  }
}
```

Then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Solution 3: Manual workaround
After installing dependencies, manually copy `.cjs` files to `.js`:

```bash
# Linux/Mac
cp node_modules/rpc-websockets/dist/lib/client.cjs node_modules/rpc-websockets/dist/lib/client.js
cp node_modules/rpc-websockets/dist/lib/server.cjs node_modules/rpc-websockets/dist/lib/server.js

# Windows PowerShell
Copy-Item node_modules/rpc-websockets/dist/lib/client.cjs node_modules/rpc-websockets/dist/lib/client.js
Copy-Item node_modules/rpc-websockets/dist/lib/server.cjs node_modules/rpc-websockets/dist/lib/server.js
```

### Related Issues
- GitHub Issue #466: https://github.com/sendaifun/solana-agent-kit/issues/466

### See Also
- [pnpm overrides documentation](https://pnpm.io/package_json#pnpmoverrides)
- [npm overrides documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
