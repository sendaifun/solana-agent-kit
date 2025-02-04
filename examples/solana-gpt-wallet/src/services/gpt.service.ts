// gpt.service.ts
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Connection } from '@solana/web3.js';
import OpenAI from 'openai';
import { SolanaAgentKit } from 'solana-agent-kit';
import { Buffer as BufferPolyfill } from 'buffer';

// Polyfill Buffer for browser environments
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || BufferPolyfill;
}

const SYSTEM_PROMPT = `You are a helpful and friendly Solana wallet assistant. Your role is to help users manage their transactions using natural language. Follow these guidelines:

1. For all interactions:
   - Be conversational and friendly
   - Always validate amounts (0.000001 SOL minimum, 100 SOL maximum for testing)
   - Format SOL amounts with 4 decimal places
   - Verify addresses are valid Solana addresses
   - Check if sufficient balance exists
   - Clearly explain what will happen

2. For 'send' commands:
   - Extract amount and address from natural language
   - If amount is missing, ask "How much SOL would you like to send?"
   - If address is missing, ask "To which address would you like to send the SOL?"
   - Always confirm before proceeding

3. For 'balance' commands:
   - Show SOL balance
   - Format nicely with symbols

4. For 'history' commands:
   - Show recent transactions
   - Include types (send/receive)
   - Show status and timestamps`;

export interface WalletCommand {
    action: 'send' | 'receive' | 'check_balance' | 'ask_address' | 'confirm_transaction' | 'show_history';
    amount?: number;
    toAddress?: string;
    message: string;
    requiresConfirmation?: boolean;
    needsMoreInfo?: boolean;
    formattedAmount?: string;
    error?: string;
}

export class GPTService {
    private openai: OpenAI;
    public agent: SolanaAgentKit | null;
    private conversationContext: any[] = [];
    private currentTransaction: {
        amount?: number;
        toAddress?: string;
        isComplete: boolean;
        fromAddress?: string;
    } | null = null;

    constructor(apiKey: string, rpcEndpoint?: string, agentKey?: string | null) {
        this.openai = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true
        });

        const endpoint = rpcEndpoint || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

        if (agentKey) {
            this.agent = new SolanaAgentKit(
                agentKey,
                endpoint ?? "",
                {} // Empty config since we're not using Jupiter
            );
        } else {
            this.agent = null;
        }

        this.initializeContext();
    }

    private initializeContext() {
        this.conversationContext = [
            { role: "developer", content: SYSTEM_PROMPT }
        ];
    }

    private validateSolanaAddress(address: string): boolean {
        try {
            new PublicKey(address);
            return true;
        } catch (error) {
            return false;
        }
    }

    private validateTransactionAddress(toAddress: string, fromAddress?: string) {
        if (!this.validateSolanaAddress(toAddress)) {
            return {
                isValid: false,
                error: "Invalid Solana address format. Please check and try again."
            };
        }

        if (fromAddress && toAddress === fromAddress) {
            return {
                isValid: false,
                error: "You cannot send to your own address. Please provide a different destination."
            };
        }

        return { isValid: true };
    }

    private validateAmount(amount: number | undefined, balance: number = Infinity) {
        if (!amount) {
            return { isValid: false, error: "Please specify an amount." };
        }

        if (amount < 0.000001) {
            return {
                isValid: false,
                error: "Amount must be at least 0.000001 SOL."
            };
        }

        if (amount > 100) {
            return {
                isValid: false,
                error: "For testing, please use an amount less than 100 SOL."
            };
        }

        if (amount > balance) {
            return {
                isValid: false,
                error: "Insufficient balance for this transaction."
            };
        }

        return { isValid: true };
    }

    async processUserInput(input: string, walletAddress?: string, balance?: number): Promise<WalletCommand> {
        try {
            this.conversationContext.push({
                role: "user",
                content: input + (walletAddress ? ` (From wallet: ${walletAddress})` : '')
            });

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: this.conversationContext,
                temperature: 0.7,
                max_tokens: 150,
                function_call: { name: "process_wallet_command" },
                functions: [
                    {
                        name: "process_wallet_command",
                        description: "Process wallet commands from natural language",
                        parameters: {
                            type: "object",
                            properties: {
                                action: {
                                    type: "string",
                                    enum: [
                                        "send",
                                        "receive",
                                        "check_balance",
                                        "ask_address",
                                        "confirm_transaction",
                                        "show_history"
                                    ]
                                },
                                amount: {
                                    type: "number",
                                    description: "Amount of SOL"
                                },
                                toAddress: {
                                    type: "string",
                                    description: "Destination wallet address"
                                },
                                message: {
                                    type: "string",
                                    description: "Response message to show to user"
                                },
                                requiresConfirmation: {
                                    type: "boolean",
                                    description: "Whether this action needs user confirmation"
                                },
                                needsMoreInfo: {
                                    type: "boolean",
                                    description: "Whether more information is needed"
                                }
                            },
                            required: ["action", "message"]
                        }
                    }
                ]
            });

            let response: WalletCommand;
            const functionCall = completion.choices[0].message.function_call;

            if (functionCall?.arguments) {
                const parsedArgs = JSON.parse(functionCall.arguments);
                response = {
                    action: parsedArgs.action,
                    amount: parsedArgs.amount,
                    toAddress: parsedArgs.toAddress,
                    message: parsedArgs.message || 'Processing your request...',
                    requiresConfirmation: parsedArgs.requiresConfirmation,
                    needsMoreInfo: parsedArgs.needsMoreInfo
                };

                switch (response.action) {
                    case 'send':
                        response = await this.handleSendCommand(response, walletAddress, balance);
                        break;
                    case 'check_balance':
                        response = await this.handleBalanceCommand(walletAddress);
                        break;
                    case 'show_history':
                        response = await this.handleHistoryCommand(walletAddress);
                        break;
                }
            } else {
                response = {
                    action: 'ask_address',
                    message: completion.choices[0].message.content || 'Could you please clarify what you\'d like to do?',
                    needsMoreInfo: true
                };
            }

            this.conversationContext.push({
                role: "assistant",
                content: response.message
            });

            if (this.conversationContext.length > 12) {
                this.conversationContext = [
                    this.conversationContext[0],
                    ...this.conversationContext.slice(-10)
                ];
            }

            return response;
        } catch (error) {
            console.error('GPT processing error:', error);
            return {
                action: 'ask_address',
                message: 'Sorry, I encountered an error processing your request. Please try again.',
                needsMoreInfo: true,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private async handleSendCommand(
        response: WalletCommand,
        walletAddress?: string,
        balance?: number
    ): Promise<WalletCommand> {
        if (!this.currentTransaction) {
            this.currentTransaction = {
                amount: response.amount,
                toAddress: response.toAddress,
                isComplete: false,
                fromAddress: walletAddress
            };
        }

        if (response.amount) {
            const amountValidation = this.validateAmount(response.amount, balance);
            if (!amountValidation.isValid) {
                return {
                    action: 'ask_address',
                    message: amountValidation.error || 'Invalid amount',
                    needsMoreInfo: true,
                    error: amountValidation.error
                };
            }
            this.currentTransaction.amount = response.amount;
        }

        if (response.toAddress) {
            const addressValidation = this.validateTransactionAddress(
                response.toAddress,
                walletAddress
            );
            if (!addressValidation.isValid) {
                return {
                    action: 'ask_address',
                    message: addressValidation.error || 'Invalid address',
                    needsMoreInfo: true,
                    error: addressValidation.error
                };
            }
            this.currentTransaction.toAddress = response.toAddress;
        }

        const txAmount = this.currentTransaction.amount;
        const txAddress = this.currentTransaction.toAddress;

        this.currentTransaction.isComplete = typeof txAmount === 'number' && typeof txAddress === 'string';

        if (this.currentTransaction.isComplete && txAmount !== undefined && txAddress) {
            response.amount = txAmount;
            response.toAddress = txAddress;
            response.requiresConfirmation = true;
            response.formattedAmount = `${txAmount.toFixed(4)} SOL`;
            response.message = `Please confirm sending ${response.formattedAmount} to ${txAddress}`;
            this.currentTransaction = null;
        } else {
            response.needsMoreInfo = true;
            if (!txAmount) {
                response.message = 'How much SOL would you like to send?';
            } else if (!txAddress) {
                response.message = `Please provide the destination address for sending ${txAmount.toFixed(4)} SOL.`;
            }
        }

        return response;
    }

    private async handleBalanceCommand(walletAddress?: string): Promise<WalletCommand> {
        if (!walletAddress) {
            return {
                action: 'check_balance',
                message: 'Please connect your wallet first.',
                needsMoreInfo: true
            };
        }

        try {
            const publicKey = new PublicKey(walletAddress);
            const connection = new Connection(
                process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '',
                { commitment: 'confirmed' }
            );

            const balanceLamports = await connection.getBalance(publicKey);
            const solBalance = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);

            return {
                action: 'check_balance',
                message: `Your balance: ${solBalance} SOL`,
                formattedAmount: `${solBalance} SOL`
            };
        } catch (error) {
            console.error('Balance fetch error:', error);
            return {
                action: 'check_balance',
                message: 'Failed to fetch balance. Please try again.',
                error: 'Failed to fetch balance'
            };
        }
    }

    private async handleHistoryCommand(walletAddress?: string): Promise<WalletCommand> {
        if (!walletAddress) {
            return {
                action: 'show_history',
                message: 'Please connect your wallet first.',
                needsMoreInfo: true
            };
        }

        try {
            if (!this.agent) {
                throw new Error('Agent not initialized');
            }

            const signatures = await this.agent.connection.getSignaturesForAddress(
                new PublicKey(walletAddress),
                { limit: 5 }
            );

            if (signatures.length === 0) {
                return {
                    action: 'show_history',
                    message: 'No transaction history found for this wallet.'
                };
            }

            return {
                action: 'show_history',
                message: `Found ${signatures.length} recent transactions.`,
                requiresConfirmation: false
            };
        } catch (error) {
            return {
                action: 'show_history',
                message: 'Failed to fetch transaction history. Please try again.',
                error: 'Failed to fetch history'
            };
        }
    }

    async createSendTransaction(fromPubkey: PublicKey, command: WalletCommand): Promise<Transaction> {
        if (!command.toAddress || !command.amount) {
            throw new Error("Missing parameters for send");
        }

        if (!this.agent) {
            throw new Error("Agent not initialized");
        }

        try {
            const transaction = await this.agent.createTransferTx(
                new PublicKey(command.toAddress),
                command.amount,
                fromPubkey
            );

            return transaction;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Transfer failed');
        }
    }
}