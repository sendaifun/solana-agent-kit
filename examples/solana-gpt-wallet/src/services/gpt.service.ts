import OpenAI from 'openai';
import { LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js';

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

3. For 'swap' commands:
   - Support swapping between SOL/USDC
   - Get price impact and estimated output
   - Always confirm before proceeding

4. For 'balance' commands:
   - Show SOL balance
   - Show token balances if available
   - Format nicely with symbols

5. For 'history' commands:
   - Show recent transactions
   - Include types (send/receive/swap)
   - Show status and timestamps
`;

export interface WalletCommand {
    action: 'send' | 'receive' | 'check_balance' | 'ask_address' | 'confirm_transaction' | 'show_history' | 'swap';
    amount?: number;
    toAddress?: string;
    fromToken?: string;
    toToken?: string;
    message: string;
    requiresConfirmation?: boolean;
    needsMoreInfo?: boolean;
    formattedAmount?: string;
    error?: string;
}

interface SwapQuoteResult {
    success: boolean;
    data?: {
        outAmount: number;
        priceImpactPct: number;
    };
    error?: string;
}


export class GPTService {
    private openai: OpenAI;
    private connection: Connection;
    private conversationContext: any[] = [];
    private currentTransaction: {
        amount?: number;
        toAddress?: string;
        isComplete: boolean;
        fromAddress?: string;
        fromToken?: string;
        toToken?: string;
    } | null = null;

    constructor(apiKey: string, rpcEndpoint?: string) {
        this.openai = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true
        });
        const endpoint = rpcEndpoint || 'https://api.devnet.solana.com';
        const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
        this.connection = new Connection(formattedEndpoint);
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

    private async getSwapQuote(inputToken: string, outputToken: string, amount: number): Promise<SwapQuoteResult> {
        const tokenAddresses = {
            SOL: 'So11111111111111111111111111111111111111112',
            USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
        };

        const inputMint = tokenAddresses[inputToken as keyof typeof tokenAddresses];
        const outputMint = tokenAddresses[outputToken as keyof typeof tokenAddresses];

        if (!inputMint || !outputMint) {
            return {
                success: false,
                error: 'Unsupported token pair'
            };
        }

        const inputAmount = inputToken === 'SOL'
            ? Math.floor(amount * LAMPORTS_PER_SOL)
            : Math.floor(amount * 1000000);

        try {
            const queryParams = new URLSearchParams({
                inputMint,
                outputMint,
                amount: inputAmount.toString(),
                slippageBps: '50',
                onlyDirectRoutes: 'false',
                asLegacyTransaction: 'true',
                useSharedAccounts: 'true',
                cluster: 'devnet'
            });

            const url = `https://quote-api.jup.ag/v6/quote?${queryParams}`;
            console.log('Requesting Jupiter quote:', {
                inputToken,
                outputToken,
                amount: inputAmount,
                url
            });

            const response = await fetch(url);
            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                return {
                    success: false,
                    error: `Invalid response from Jupiter: ${text}`
                };
            }

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Failed to get quote'
                };
            }

            if (!data?.data?.[0]) {
                return {
                    success: false,
                    error: 'No routes available. Try a smaller amount or different tokens.'
                };
            }

            const bestRoute = data.data[0];
            const outAmount = outputToken === 'SOL'
                ? bestRoute.outAmount / LAMPORTS_PER_SOL
                : bestRoute.outAmount / 1000000;

            return {
                success: true,
                data: {
                    outAmount,
                    priceImpactPct: bestRoute.priceImpactPct
                }
            };

        } catch (error) {
            console.error('Swap quote error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
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
                                        "show_history",
                                        "swap"
                                    ]
                                },
                                amount: {
                                    type: "number",
                                    description: "Amount of SOL or tokens"
                                },
                                toAddress: {
                                    type: "string",
                                    description: "Destination wallet address"
                                },
                                fromToken: {
                                    type: "string",
                                    description: "Token to swap from"
                                },
                                toToken: {
                                    type: "string",
                                    description: "Token to swap to"
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
                    fromToken: parsedArgs.fromToken,
                    toToken: parsedArgs.toToken,
                    message: parsedArgs.message || 'Processing your request...',
                    requiresConfirmation: parsedArgs.requiresConfirmation,
                    needsMoreInfo: parsedArgs.needsMoreInfo
                };

                switch (response.action) {
                    case 'send':
                        response = await this.handleSendCommand(response, walletAddress, balance);
                        break;
                    case 'swap':
                        response = await this.handleSwapCommand(response, walletAddress, balance);
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

        this.currentTransaction.isComplete =
            typeof this.currentTransaction.amount === 'number' &&
            typeof this.currentTransaction.toAddress === 'string';

        if (this.currentTransaction.isComplete) {
            response.amount = this.currentTransaction.amount;
            response.toAddress = this.currentTransaction.toAddress;
            response.requiresConfirmation = true;
            response.formattedAmount = `${this.currentTransaction.amount.toFixed(4)} SOL`;
            response.message = `Please confirm sending ${response.formattedAmount} to ${response.toAddress}`;
            this.currentTransaction = null;
        } else {
            response.needsMoreInfo = true;
            if (!response.amount) {
                response.message = 'How much SOL would you like to send?';
            } else if (!response.toAddress) {
                response.message = `Please provide the destination address for sending ${response.amount.toFixed(4)} SOL.`;
            }
        }

        return response;
    }

    private async handleSwapCommand(
        response: WalletCommand,
        walletAddress?: string,
        balance?: number
    ): Promise<WalletCommand> {
        if (!this.currentTransaction) {
            this.currentTransaction = {
                amount: response.amount,
                fromToken: response.fromToken?.toUpperCase() || 'SOL',
                toToken: response.toToken?.toUpperCase() || 'USDC',
                isComplete: false,
                fromAddress: walletAddress
            };
        }

        if (response.amount) {
            if (this.currentTransaction.fromToken === 'SOL') {
                const amountValidation = this.validateAmount(response.amount, balance);
                if (!amountValidation.isValid) {
                    return {
                        action: 'swap',
                        message: amountValidation.error || 'Invalid amount',
                        needsMoreInfo: true,
                        error: amountValidation.error
                    };
                }
            }
            this.currentTransaction.amount = response.amount;
        }

        if (response.fromToken) this.currentTransaction.fromToken = response.fromToken.toUpperCase();
        if (response.toToken) this.currentTransaction.toToken = response.toToken.toUpperCase();

        if (this.currentTransaction.fromToken === this.currentTransaction.toToken) {
            return {
                action: 'swap',
                message: 'Cannot swap a token for itself',
                needsMoreInfo: true,
                error: 'Invalid token pair'
            };
        }

        this.currentTransaction.isComplete =
            typeof this.currentTransaction.amount === 'number' &&
            typeof this.currentTransaction.fromToken === 'string' &&
            typeof this.currentTransaction.toToken === 'string';

        if (this.currentTransaction.isComplete) {
            const quoteResult = await this.getSwapQuote(
                this.currentTransaction.fromToken,
                this.currentTransaction.toToken,
                this.currentTransaction.amount
            );

            if (!quoteResult.success || !quoteResult.data) {
                return {
                    action: 'swap',
                    message: quoteResult.error || 'Failed to get swap quote',
                    needsMoreInfo: true,
                    error: quoteResult.error
                };
            }

            response.amount = this.currentTransaction.amount;
            response.fromToken = this.currentTransaction.fromToken;
            response.toToken = this.currentTransaction.toToken;
            response.requiresConfirmation = true;
            response.formattedAmount = `${this.currentTransaction.amount.toFixed(4)} ${this.currentTransaction.fromToken}`;
            response.message = `Ready to swap ${response.formattedAmount} for approximately ${quoteResult.data.outAmount.toFixed(4)} ${this.currentTransaction.toToken} (Price Impact: ${quoteResult.data.priceImpactPct.toFixed(2)}%)`;

            this.currentTransaction = null;
        } else {
            response.needsMoreInfo = true;
            if (!response.amount) {
                response.message = `How much ${this.currentTransaction.fromToken} would you like to swap?`;
            } else if (!response.fromToken || !response.toToken) {
                response.message = 'Please specify which tokens you want to swap between (SOL or USDC).';
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
            const balanceLamports = await this.connection.getBalance(
                new PublicKey(walletAddress)
            );
            return {
                action: 'check_balance',
                message: `Your balance is ${(balanceLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
                formattedAmount: `${(balanceLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`
            };
        } catch (error) {
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
            const signatures = await this.connection.getSignaturesForAddress(
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

    clearContext() {
        this.initializeContext();
        this.currentTransaction = null;
    }
}