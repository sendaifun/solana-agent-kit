import { Keypair, VersionedTransaction, SimulatedTransactionResponse, PublicKey } from "@solana/web3.js";

import { SolanaAgentKit } from "../../src/index";
import { createSolanaProxy } from "./solanaProxyServer";
import bs58 from "bs58";
import { TransactionMessage } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";

function startProxy() {
    const rpcUrl = process.env.RPC_URL!;

    // Store callback in a mutable variable
    let simulationCallback: (tx: VersionedTransaction, simulationResult: any) => Promise<any> = () => Promise.resolve();

    let transactionRewriteCallback: (tx: VersionedTransaction) => Promise<VersionedTransaction> = (tx) => Promise.resolve(tx);

    const proxyServer = createSolanaProxy(rpcUrl, 3000, async (tx, simulationResult) => {
        return simulationCallback(tx, simulationResult);
    }, async (tx) => {
        return transactionRewriteCallback(tx);
    });


    // Return callback setter along with agent and server
    return {
        proxyServer,
        setSimulationCallback: (newCallback: typeof simulationCallback) => {
            simulationCallback = newCallback;
        },
        setTransactionRewriteCallback: (newCallback: typeof transactionRewriteCallback) => {
            transactionRewriteCallback = newCallback;
        }
    };
}

// raj.sol
const MAINNET_SOL_SPONSOR_KEY = "E645TckHQnDcavVv92Etc6xSWQaq8zzPtPRGBheviRAk";

export class TestHarness {
    private proxyServer: ReturnType<typeof createSolanaProxy>;
    private simulationCallback: (tx: VersionedTransaction, simulationResult: any) => Promise<any> = () => Promise.resolve();
    private transactionRewriteCallback: (tx: VersionedTransaction) => Promise<VersionedTransaction> = (tx) => Promise.resolve(tx);

    public agent: SolanaAgentKit;
    public shouldFail = false;

    public sponsorFundInSimulation: { lamports: number, sponsorKey?: string, toKey: string } | null = null;

    constructor({
        privateKey,
    }: {
        privateKey?: Uint8Array;
    }) {
        const { proxyServer, setSimulationCallback, setTransactionRewriteCallback } = startProxy();

        this.agent = new SolanaAgentKit(privateKey ?
            bs58.encode(privateKey)
            :
            process.env.SOLANA_PRIVATE_KEY ?? bs58.encode(Keypair.generate().secretKey),
            "http://localhost:3000",
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
            this.shouldFail = true;
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

    async runTest(name: string, testFn: (agent: SolanaAgentKit) => Promise<void>) {
        console.log(`\n=== Running test: ${name} ===`);
        try {
            await testFn(this.agent);
            console.log(`✅ ${name} - Success`);
        } catch (e) {
            console.error(`❌ ${name} - Failed:`, e);
            this.shouldFail = true;
        }
    }

    setSimulationCallback(cb: typeof this.simulationCallback) {
        this.simulationCallback = cb;
    }

    setTransactionRewriteCallback(cb: typeof this.transactionRewriteCallback) {
        this.transactionRewriteCallback = cb;
    }

    cleanup() {
        this.proxyServer.close();
    }
}
