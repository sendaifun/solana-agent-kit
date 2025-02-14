import { Keypair, VersionedTransaction, SimulatedTransactionResponse, PublicKey } from "@solana/web3.js";

import { SolanaAgentKit } from "../../src/index";
import { createSolanaProxy } from "./solanaProxyServer";
import bs58 from "bs58";
import { TransactionMessage } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { execSync } from 'child_process';

async function startProxy() {
    const rpcUrl = process.env.RPC_URL! ?? "https://api.mainnet-beta.solana.com";

    // Store callback in a mutable variable
    let simulationCallback: (tx: VersionedTransaction, simulationResult: any) => Promise<any> = () => Promise.resolve();

    let transactionRewriteCallback: (tx: VersionedTransaction) => Promise<VersionedTransaction> = (tx) => Promise.resolve(tx);

    const isPortUsed = (port: number) => {
        try {
            execSync(`lsof -i:${port}`, { stdio: 'ignore' });
            return true;
        } catch (e) {
            return false;
        }
    };

    // Find first available port between 3000-4000
    let port = 3000;

    // This port deciding process is only needed when running tests in parallel (disabled by default)
    while (port < 4000) {
        // Attempt to break race conditions
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        if (!isPortUsed(port)) {
            const proxyServer = createSolanaProxy(rpcUrl, port, async (tx, simulationResult) => {
                return simulationCallback(tx, simulationResult);
            }, async (tx) => {
                return transactionRewriteCallback(tx);
            })

            return {
                port,
                proxyServer,
                setSimulationCallback: (newCallback: typeof simulationCallback) => {
                    simulationCallback = newCallback;
                },
                setTransactionRewriteCallback: (newCallback: typeof transactionRewriteCallback) => {
                    transactionRewriteCallback = newCallback;
                }
            }
        }
        port++;
    }
    if (port >= 4000) {
        throw new Error('No available ports found between 3000-4000');
    }
    return null;
}

// raj.sol - can be any wallet with enough SOL to sponsor the transaction in simulation
const MAINNET_SOL_SPONSOR_KEY = "E645TckHQnDcavVv92Etc6xSWQaq8zzPtPRGBheviRAk";

export class TestHarness {
    private proxyServer: ReturnType<typeof createSolanaProxy>;
    private simulationCallback: (tx: VersionedTransaction, simulationResult: any) => Promise<any> = () => Promise.resolve();
    private transactionRewriteCallback: (tx: VersionedTransaction) => Promise<VersionedTransaction> = (tx) => Promise.resolve(tx);

    public agent: SolanaAgentKit;

    public sponsorFundInSimulation: { lamports: number, sponsorKey?: string, toKey: string } | null = null;

    constructor({
        privateKey,
    }: {
        privateKey?: Uint8Array;
    }) {

        this.agent = new SolanaAgentKit(privateKey ?
            bs58.encode(privateKey)
            :
            process.env.SOLANA_PRIVATE_KEY ?? bs58.encode(Keypair.generate().secretKey),
            // Default, will be overridden by setup()
            `http://localhost:3000`,
            {
                OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
            }
        );
    }

    async setup() {
        const proxyServerInfo = await startProxy();
        if (!proxyServerInfo) {
            throw new Error('No available ports found between 3000-4000');
        }
        const { proxyServer, port, setSimulationCallback, setTransactionRewriteCallback } = proxyServerInfo;

        this.agent = new SolanaAgentKit(bs58.encode(this.agent.wallet.secretKey),
            `http://localhost:${port}`,
            {
                OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
            }
        );
        this.proxyServer = proxyServer;

        setSimulationCallback(this.handleSimulation.bind(this));
        setTransactionRewriteCallback(this.handleTransactionRewrite.bind(this));
    }

    private async handleSimulation(tx: VersionedTransaction, simulationResult: { value: SimulatedTransactionResponse }) {
        if (simulationResult.value.err) {
            console.error("Transaction simulation failed:", simulationResult.value.err);
            console.error(simulationResult.value);
        }
        return this.simulationCallback(tx, simulationResult);
    }

    private async handleTransactionRewrite(tx: VersionedTransaction) {
        if (this.sponsorFundInSimulation) {
            const message = TransactionMessage.decompile(tx.message);
            message.instructions = [
                SystemProgram.transfer({
                    fromPubkey: this.sponsorFundInSimulation.sponsorKey ? new PublicKey(this.sponsorFundInSimulation.sponsorKey) : new PublicKey(MAINNET_SOL_SPONSOR_KEY),
                    lamports: this.sponsorFundInSimulation.lamports,
                    toPubkey: new PublicKey(this.sponsorFundInSimulation.toKey),
                }),
                ...message.instructions,
            ]

            message.payerKey = new PublicKey(this.sponsorFundInSimulation.sponsorKey ?? MAINNET_SOL_SPONSOR_KEY);

            const newTx = new VersionedTransaction(message.compileToV0Message(), [...tx.signatures, tx.signatures[0]]);
            return newTx;
        }
        return this.transactionRewriteCallback(tx);
    }

    setSimulationCallback(cb: typeof this.simulationCallback) {
        this.simulationCallback = cb;
    }

    setTransactionRewriteCallback(cb: typeof this.transactionRewriteCallback) {
        this.transactionRewriteCallback = cb;
    }

    cleanup() {
        this.proxyServer?.close();
    }
}
