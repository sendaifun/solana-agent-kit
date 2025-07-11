import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { get_verified_programs } from "../tools";

const getVerifiedPrograms: Action = {
  name: "OSEC_GET_VERIFIED_PROGRAM",
  description: "Get list of all verified programs",
  similes: [
    "get solana verified program list",
    "fetch solana verified program list",
    "get all solana verified programs",
    "fetch all solana verified programs",
  ],
  examples: [
    [
      {
        input: {
          page: 1,
        },
        output: {
          meta: {
            total: 173,
            page: 1,
            total_pages: 9,
            items_per_page: 20,
            has_next_page: true,
            has_prev_page: false,
          },
          verified_programs: [
            "12UJoD4VRHneWXoy1j4k3KTACP8ZYX55sS4sbwzuk8KF",
            "14XDwwZQABkP3A8AqymsThii5o3FLULxZqLCkGbX1hHp",
            "1uteB5DZdNfns9B12rgGf5msKh1d7FbbkvciWmhsZiC",
            "23BCUPpfPkfCu6bmPCaLgyTR8UkruWeUnEyeC5shr1mp",
            "2AxuNr6euZPKQbTwNsLBjzFTZFAevA85F4PW9m9Dv8pc",
            "2bag6xpshpvPe7SJ9nSDLHpxqhEAoHPGpEkjNSv7gxoF",
            "2gFsaXeN9jngaKbQvZsLwxqfUrT2n4WRMraMpeL8NwZM",
            "2TtLXuQzQ2VaBgmbrUAt9PviBSJ1W4FugSpE4gZZe2rL",
            "2vAaF2P7QriWd5VJioSoiyBdU1ieU7mQX5qCp3djD61G",
            "2WD22uocFoBSSFa8ERmZ4B6cuCBYnYD4KVKgMikUQA21",
            "2XAvoV6fspy48bBwNsr3CvQPgG8aZymSdxjriYA2ZWBH",
            "3pVZ5as41wf864VxTiWXrMAuZYKsB7p4jGKgQ7e6WMwp",
            "3RPSfyWzBxcwfTNFBm6EVGdEy2qiM3cpHoWAUTSUCW4s",
            "3ujQg6Cqf5XycaPGRbEqZkTwRQSDmE8ThKfZXhCMy5o9",
            "3YuetPvpuit3JF8tHteSoA6CKhPsjhfk5NNQsF3Lpo7q",
            "41FGToCmdaWa1dgZLKFAjvmx6e6AjVTX7SVRibvsMGVB",
            "45NNnmsshdzzaZeQ8o1AAQTsmxhSX5FRzjVbMS2MFBMx",
            "47YGQvDJJzMAAq7Z6x7LegYhS5Dremk5sGRYGjkAM7c2",
            "49BqhK92MRb1tpwn5ceLsZZnGoSQaWzYRcPC6doCgUiE",
            "4EMDPYMakiVuCUpsTdw26LkVcGwHUYaJLtXTLxCHzPDs",
          ],
        },
        explanation: "solana verified program list are successfully fetched",
      },
    ],
  ],
  schema: z.object({
    page: z.number(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { page } = input;

      const data = await get_verified_programs({ page });

      return {
        status: "success",
        data,
        message: "Solana verified program list are successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get solana verified program list ${error.message}`,
        code: error.code || "OTTERSEC_GET_VERIFIED_PROGRAMS_FAILED",
      };
    }
  },
};

export default getVerifiedPrograms;
