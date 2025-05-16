import type { Plugin } from "solana-agent-kit";
import rockPaperScissorAction from "./sendarcade/actions/rockPaperScissors";
import { rock_paper_scissor } from "./sendarcade/tools/rock_paper_scissor";

// Define and export the plugin
const BlinksPlugin = {
  name: "blinks",

  // Combine all tools
  methods: {
    // Sendarcade methods
    rock_paper_scissor,
  },

  // Combine all actions
  actions: [
    // Sendarcade actions
    rockPaperScissorAction,
  ],

  // Initialize function
  initialize: function (): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} satisfies Plugin;

export default BlinksPlugin;
