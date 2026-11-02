import { makeAction } from "./factory.js";

export const protocolInfoAction = makeAction({
  op: "h081_protocol_info",
  name: "H081_PROTOCOL_INFO",
  similes: [
    "about h081",
    "h081 program ids",
    "h081 deposit caps",
    "h081 relayer fee",
    "what is h081 capital",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          cluster: "mainnet-beta",
          rpc: "api.mainnet-beta.solana.com",
          rpcIsPublic: true,
          programs: {
            pool: "E16DKmtrYtYGp7guSso25Pvq8gzKunnUULU28RmRmDGM",
            loan: "8JBd7epQXxdcKRMaWM1S5PC7nsQKoZq3uCetpiJ684g4",
            safety: "HmzKNPn8LaRyjmggt2uT95B7KvphtoVXQkeVc2HHARTt",
            capacity: "CH1rrfFyJMVn158UHL2fLpKTtoLJojrz5f68toMQdQKU",
          },
          usdg: {
            mint: "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH",
            decimals: 6,
            symbol: "USDG",
          },
          h081: {
            mint: "EgqxxR7zowzaLEm24oep5qqBieLVAWYX78LhgeqAJAo",
            decimals: 6,
            symbol: "H081",
          },
          caps: {
            perDepositUsdg: "1000",
            totalUsdg: "10000",
            inVaultUsdg: "2500",
            paused: false,
          },
          relayer: {
            url: "https://h081-relayer.vercel.app",
            minFee: "50000",
            feeBps: 20,
            feeAccount: "DxpmCZYAoDKpHmA5vWuopUrf3UVuGnPvditVrN9xDwDo",
            freeTier: "100000000",
          },
          relayerStatus: "ok",
          account: { source: "seed" },
          notice:
            "H081 Capital is live on Solana mainnet; it is not audited yet; use at your own risk.",
        },
        explanation:
          "The deployed programs, the assets, the live caps and the relayer terms. Only the RPC host is reported, never the URL.",
      },
    ],
  ],
});
