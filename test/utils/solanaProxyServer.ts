import express from "express";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import * as bodyParser from "body-parser";

export function createSolanaProxy(realRpcUrl: string, port: number, transactionSimulationCallback?: (tx: VersionedTransaction, simulationResult: any) => Promise<any>, transactionRewriteCallback?: (tx: VersionedTransaction) => Promise<VersionedTransaction>) {
    const app = express();

    app.use(bodyParser.json());

    // Create our own connection for simulation
    const simulationConnection = new Connection(realRpcUrl);

    // Transaction simulation handler
    app.post("/", async (req, res) => {
        if (req.body.method === "sendTransaction") {
            console.log("(POST - SEND) req.body.method", req.body.method);
            try {
                const rawTx = req.body.params[0];
                const txBuffer = Buffer.from(rawTx, "base64");

                let tx = VersionedTransaction.deserialize(txBuffer);

                if (transactionRewriteCallback) {
                    tx = await transactionRewriteCallback(tx);
                }

                // Simulate the transaction
                const simulationResult =
                    await simulationConnection.simulateTransaction(tx, { replaceRecentBlockhash: true, commitment: "confirmed" });

                if (simulationResult.value.err) {
                    res.json({
                        jsonrpc: "2.0",
                        error: {
                            code: -32002,
                            message: `Simulation failed: ${JSON.stringify(simulationResult.value.err)}`,
                            data: simulationResult,
                        },
                        id: req.body.id,
                    });
                } else {
                    res.json({
                        jsonrpc: "2.0",
                        result: "11111111111111111111111111111111", // Fake signature
                        id: req.body.id,
                    });
                }

                if (transactionSimulationCallback) {
                    await transactionSimulationCallback(tx, simulationResult).catch((e) => {
                        console.error("Please do not throw errors in the transaction simulation callback");
                    });
                }

            } catch (error) {
                res.json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32603,
                        message: `Simulation error: ${(error as any).message}`,
                    },
                    id: req.body.id,
                });
            }
        } else {
            // Forward other methods
            console.log("(POST - OTHER)", req.body.length > 0 ? req.body.map((item: any) => item.method) : req.body.method);

            fetch(realRpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body)
            }).then(async (response) => {
                res.status(response.status);
                for (const [key, value] of Object.entries(response.headers)) {
                    res.setHeader(key, value);
                }
                const data = await response.json();
                res.json(data);
            }).catch(error => {
                console.error('Proxy error:', error);
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal proxy error'
                    },
                    id: req.body.id
                });
            });
        }
    });

    return app.listen(port, () => {
        console.log(`Solana proxy server running on port ${port}`);
    });
}
