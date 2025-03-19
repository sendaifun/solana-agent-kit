import { runEvals } from "../utils/runEvals";

const CREATE_GIBWORK_TASK_DATASET = [
  {
    inputs: {
      query:
        "Create a gibwork task titled 'Fix my website' for 1000 JUP tokens, set content, requirements as 'N/A' and add the 'webdev' tag.",
    },
    referenceOutputs: {
      tool: "create_gibwork_task",
      response: JSON.stringify({
        title: "Fix my website",
        content: "N/A",
        requirements: "N/A",
        tags: ["webdev"],
        tokenMintAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        amount: 10,
      }),
    },
  },
];

runEvals(CREATE_GIBWORK_TASK_DATASET, "create_gibwork_task eval");
