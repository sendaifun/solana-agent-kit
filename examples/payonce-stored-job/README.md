# Check a stored-job payment receipt without a wallet

This optional example checks the public **devnet** payment made by the PayOnce
AgentKit experiment. It needs no wallet, private key, API account or test SOL.
It makes two read-only RPC requests; it does not run a payment action.
The example and PayOnce packages are contributed by their authors, KairosElpis.

From this directory, with Node.js 22 or later:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run verify
```

The live command first checks the devnet genesis hash, then requests the recorded
transaction at `finalized` commitment. It binds the program event to the saved
payer, lane, sequence, destination, amount and fee ceiling. It also checks the
historical account balance changes: **651,240 lamports** to the recipient,
**5,000** to the test treasury and **5,000** in network fees.
Expected output includes `status: paid`, `rpcRequests: 2`, and zero signed or
submitted transactions. This is the authors' own test payment, not independent
adoption or mainnet revenue.

`SOLANA_RPC_URL` can select another devnet RPC. A wrong cluster, unavailable
transaction, RPC error or mismatched receipt makes the command exit non-zero.
Devnet history can disappear. There is no automatic fallback, payment retry or
inference that an unavailable transaction was unpaid.

To inspect the saved fixture without RPC access:

```bash
npm run verify:offline
```

That output explicitly says **NOT a live chain check**. `npm test` uses the same
saved fixture and negative controls; it never contacts the network. The fixture
contains only public transaction data and the original stored payment terms.

## Use with an AgentKit job

The optional plugin `@kairos_elpis/payonce-agent-kit-prototype@0.0.1` registers
`PAYONCE_PAY_STORED_SOL_JOB`; its action input is a job ID. The host supplies
immutable authorized payment terms and must preserve them across retries. After
an ambiguous response, reconcile the original signature against those terms.
A returned signature or `UnexpectedSequence` (6003) alone is not proof of payment.

See the [plugin integration and authorization boundaries](https://github.com/KairosElpis/payonce-prototype/blob/4abf1f8/NPM.md)
and [full AgentKit devnet experiment](https://github.com/KairosElpis/payonce-prototype/blob/4abf1f8/DEVNET.md)
for the wallet-backed action, lane initialization and retry reproduction.
This small verifier intentionally installs only the receipt SDK and web3.js;
it does not register tools in AgentKit or change the core dependencies.

## Trust and scope

The result trusts the selected RPC's transaction data and finality. It is not an
independent cryptographic proof. The devnet program is upgradeable; this checks
one historical transaction, not the safety or behavior of a future program
version. The saved fixture is an illustration, not a live chain attestation.
This does not implement durable job storage, crash recovery, signature recovery
or mainnet payments. Installing a package is not evidence that anyone uses it.
