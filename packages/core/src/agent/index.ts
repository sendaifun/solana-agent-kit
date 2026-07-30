import { Connection } from "@solana/web3.js";
import type { Action, Config, Plugin } from "../types";
import { BaseWallet, EvmWallet } from "../types/wallet";
import { wrapWallet } from "../utils/wrapWallet";

/**
 * Defines a type that merges all plugin methods into the `methods` object
 */
type PluginMethods<T> = T extends Plugin ? T["methods"] : Record<string, never>;

/**
 * Main class for interacting with Solana blockchain.
 *
 * @example
 * // Define a plugin
 * const tokenPlugin = {
 *    name: "tokenPlugin",
 *    actions: [],
 *    methods: {
 *      transferToken: (to: string, amount: number) => {
 *        console.log(`Transferring ${amount} to ${to}`);
 *      },
 *    },
 *    initialize: (agent: any) => {},
 * };
 *
 * @example
 * // Create SolanaAgentKit instance
 * const agent = new SolanaAgentKit({
 *  signTransaction: async (tx) => {},
 *  signAllTransactions: async (txs) => {},
 *  sendTransaction: async (tx) => {},
 *  publicKey: "SomePublicKey",
 * }, "<rpcUrl>", {}, {
 *  address: "SomeEVMAddress",
 *  getAddress: async () => "SomeEVMAddress",
 *  signMessage: async (message) => "signedMessage",
 *  signTransaction: async (tx) => "signedTx",
 *  sendTransaction: async (rawSignedTx) => "txHash",
 *  _signTypedData: async (domain, types, message) => "signedTypedData",
 * });
 *
 * @example
 * // Add plugin
 * const agentWithPlugins = agent.use(tokenPlugin);
 *
 * @example
 * // Use plugin method
 * agentWithPlugins.methods.transferToken("SomePublicKey", 100);
 */
export class SolanaAgentKit<TPlugins = Record<string, never>> {
  public connection: Connection;
  public config: Config;
  public wallet: BaseWallet;
  public evmWallet?: EvmWallet;
  private plugins: Map<string, Plugin> = new Map();

  public methods: TPlugins = {} as TPlugins;
  public actions: Action[] = [];

  constructor(
    wallet: BaseWallet,
    rpc_url: string,
    config: Config,
    evmWallet?: EvmWallet,
  ) {
    this.connection = new Connection(rpc_url);
    // Refuse-before-sign seat: wrap at construction so plugin direct wallet
    // calls (signAndSendTransaction etc.) cannot bypass the policy.
    this.wallet = config?.beforeSign
      ? wrapWallet(wallet, config.beforeSign)
      : wallet;
    this.config = config;
    this.evmWallet = evmWallet;
  }

  /**
   * Adds a plugin and registers its methods inside `methods`
   */
  use<P extends Plugin>(
    plugin: P,
  ): SolanaAgentKit<TPlugins & PluginMethods<P>> {
    if (this.plugins.has(plugin.name)) {
      return this as SolanaAgentKit<TPlugins & PluginMethods<P>>;
    }
    plugin.initialize(this as SolanaAgentKit);

    // Register plugin methods inside `methods`
    for (const [methodName, method] of Object.entries(plugin.methods)) {
      if ((this.methods as Record<string, unknown>)[methodName]) {
        throw new Error(`Method ${methodName} already exists in methods`);
      }
      (this.methods as Record<string, unknown>)[methodName] =
        method.bind(plugin);
    }

    for (const action of plugin.actions) {
      this.actions.push(action);
    }

    this.plugins.set(plugin.name, plugin);
    return this as SolanaAgentKit<TPlugins & PluginMethods<P>>;
  }
}
