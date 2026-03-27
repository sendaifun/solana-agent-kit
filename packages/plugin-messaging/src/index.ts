import type { Plugin } from "solana-agent-kit";
import getMyIdentityAction from "./actions/getMyIdentity";
import getUserInfoAction from "./actions/getUserInfo";
import listConversationsAction from "./actions/listConversations";
import markReadAction from "./actions/markRead";
import readMessagesAction from "./actions/readMessages";
import searchAgentsAction from "./actions/searchAgents";
import sendMessageAction from "./actions/sendMessage";
import {
  getMyIdentity,
  getUserInfo,
  listConversations,
  markRead,
  readMessages,
  searchAgents,
  sendMessage,
} from "./shared";

const MessagingPlugin = {
  name: "messaging",
  methods: {
    sendMessage,
    readMessages,
    markRead,
    listConversations,
    getUserInfo,
    getMyIdentity,
    searchAgents,
  },
  actions: [
    sendMessageAction,
    readMessagesAction,
    markReadAction,
    listConversationsAction,
    getUserInfoAction,
    getMyIdentityAction,
    searchAgentsAction,
  ],
  initialize: function (): void {
    for (const [methodName, method] of Object.entries(this.methods)) {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    }
  },
} satisfies Plugin;

export type * from "./types";
export default MessagingPlugin;
