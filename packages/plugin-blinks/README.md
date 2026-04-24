# @solana-agent-kit/plugin-blinks

This plugin provides a set of tools and actions for Solana Actions + Blinks integrations.

## Tools Available

### Send
- `sendArcadeGames` - Integrate with a send arcade game. Specifically rock, paper, scissors.

### AlgoVoi (multi-chain payment facilitator — Solana flow)
- `algovoi_pay_checkout` - Settle a hosted AlgoVoi checkout on Solana. The agent's wallet signs an SPL USDC transfer that carries a Solana Pay `reference` pubkey, so AlgoVoi's facilitator can verify settlement on-chain deterministically (no memo, no amount-uniqueness gymnastics).
- `algovoi_get_checkout` - Fetch Actions metadata (amount, title, disabled state) for an AlgoVoi checkout without signing. Useful for previewing before pay.

See [`src/algovoi/README.md`](./src/algovoi/README.md) for details.
