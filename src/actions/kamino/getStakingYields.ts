import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";

const getStakingYieldsAction: Action = {
  name: "GET_STAKING_YIELDS",
  similes: [
    "get staking yields",
    "get staking yield",
    "get staking yield info",
    "get staking yield details",
    "get staking yield data",
  ],
  description: "Get staking yields for SOL on Kamino.",
  examples: [
    [
      {
        input: {
        },
        output: {
          status: "success",
          result: [
            {
              "apy": "0.080390230522893878888560071030196746032",
              "tokenMint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
            },
            {
              "apy": "0.078333895419185898024956976717389961365",
              "tokenMint": "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1"
            },
            {
              "apy": "-0.0001947928085658686723281041602607122696",
              "tokenMint": "LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X"
            },
            {
              "apy": "0.078628129598005002988425816889337410799",
              "tokenMint": "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"
            },
            {
              "apy": "0.10035173180597760464874387302499426026",
              "tokenMint": "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"
            },
            {
              "apy": "0.073193546572939908570080714561436044731",
              "tokenMint": "LSTxxxnJzKDFSLr4dUkPcmCf5VyryEqzPLz5j4bpxFp"
            },
            {
              "apy": "0.081816047034325518682416113628043149495",
              "tokenMint": "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v"
            },
            {
              "apy": "0.088747212259138541929287715034010335824",
              "tokenMint": "he1iusmfkpAdwvxLNGV8Y1iSbj4rUy6yMhEA3fotn9A"
            },
            {
              "apy": "0.073357450960208230517986171136196512709",
              "tokenMint": "vSoLxydx6akxyMD9XEcPvGYNGq6Nn66oqVb3UkGkei7"
            },
            {
              "apy": "0.078333797313658231460680045682594816374",
              "tokenMint": "BonK1YhkXEGLZzwtcvRTip3gAL9nCeQD7ppZBLXhtTs"
            },
            {
              "apy": "0.078640643670503023115741961450340978515",
              "tokenMint": "Comp4ssDzXcLeu2MnLuGNNFC4cmLPMng8qWHPvzAMU1h"
            },
            {
              "apy": "0.000000000247065466007632155516496902206",
              "tokenMint": "Fi5GayacZzUrfaCRCJtBz2vSYkGF56xjgCceZx5SbXwq"
            },
            {
              "apy": "0.093288079622810996602537844279182051111",
              "tokenMint": "picobAEvs6w7QEknPce34wAE4gknZA9v5tTonnmHYdX"
            },
            {
              "apy": "0.07396030159543889071788608698182042665",
              "tokenMint": "HUBsveNpjo5pWqNkH57QzxjQASdTVXcSK7bVKTSZtcSX"
            },
            {
              "apy": "0.06240332988070912665961278016290413743",
              "tokenMint": "BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85"
            },
            {
              "apy": "0.060425625674802835277444708206678174953",
              "tokenMint": "Bybit2vBJGhPF52GBdNaQfUJ6ZpThSgHBobjWZpLPb4B"
            },
            {
              "apy": "0.092010611880766711288803689376299527318",
              "tokenMint": "Dso1bDeDjCQxTrWHqUUi63oBvV7Mdm6WaobLbQ7gnPQ"
            },
            {
              "apy": "0.003004558170997191934202137888207450238",
              "tokenMint": "ezSoL6fY1PVdJcJsUpe5CM3xkfmy3zoVCABybm5WtiC"
            },
            {
              "apy": "0.002223479287938869298752878567696451589",
              "tokenMint": "kySo1nETpsZE2NWe5vj2C64mPSciH1SppmHb4XieQ7B"
            }
          ],
        },
        explanation: "Get staking yields for SOL on Kamino.",
      },
    ],
  ],
  schema: z.object({
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const res = await agent.getKaminoStakingYields();
      return {
        status: "success",
        res,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get staking yields: ${error.message}`,
      };
    }
  },
};

export default getStakingYieldsAction;
