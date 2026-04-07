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
import type { MessagingPluginContract, PluginAction } from "./types";

const methods: Record<string, any> = {
  sendMessage,
  readMessages,
  markRead,
  listConversations,
  getUserInfo,
  getMyIdentity,
  searchAgents,
};

const actions: PluginAction[] = [
  sendMessageAction,
  readMessagesAction,
  markReadAction,
  listConversationsAction,
  getUserInfoAction,
  getMyIdentityAction,
  searchAgentsAction,
];

const MessagingPlugin: MessagingPluginContract = {
  name: "messaging",
  methods,
  actions,
  initialize: function (): void {
    for (const [methodName, method] of Object.entries(this.methods)) {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    }
  },
};

export default MessagingPlugin;
