# @solana-agent-kit/plugin-apex

Two actions on the public APEX routes. This plugin does not sign and does not pay.

- `APEX_TX_CHECK` simulates one unsigned Solana transaction and returns SAFE or RISKY. It flags a token drain, a delegate approval, and a rug mint. 0.001 USDC.
- `APEX_DELIVERY_SCORE` scores one https x402 URL from 0 to 100. It does not pay that URL. 0.003 USDC.

On HTTP 402 the result is the payment terms. Pay them with your own wallet.

```ts
import ApexPlugin from "@solana-agent-kit/plugin-apex";
```

Free samples: https://apexfaucet.xyz/tx-check and https://apexfaucet.xyz/delivery-score?url=https://apexfaucet.xyz/api/x402/page-markdown
