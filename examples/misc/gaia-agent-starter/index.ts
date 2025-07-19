import { OpenAI } from 'openai';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = [
  'GAIA_NODE_URL',
  'GAIA_API_KEY',
  'GAIA_MODEL_NAME',
  'RPC_URL',
  'SOLANA_PRIVATE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in the environment variables.`);
    console.error('Please create a .env file based on .env.example and set all required variables.');
    process.exit(1);
  }
}

// Initialize Solana connection and wallet
let connection: Connection;
let keypair: Keypair;

try {
  connection = new Connection(process.env.RPC_URL!);
  const privateKeyBytes = bs58.decode(process.env.SOLANA_PRIVATE_KEY!);
  keypair = Keypair.fromSecretKey(privateKeyBytes);
  console.log(`Wallet address: ${keypair.publicKey.toString()}`);
} catch (error) {
  console.error('Error initializing Solana connection or wallet:', error);
  process.exit(1);
}

// Initialize OpenAI client with Gaia configuration
const openai = new OpenAI({
  apiKey: process.env.GAIA_API_KEY,
  baseURL: process.env.GAIA_NODE_URL,
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Chat history to maintain context
const history: { role: 'user' | 'assistant' | 'system' | 'function'; name?: string; content: string }[] = [];

// Add system message to explain the purpose
history.push({
  role: 'system',
  content: 'You are an AI assistant that helps users with Solana blockchain operations. ' +
    'You can provide information about tokens, transactions, and execute operations on the blockchain. ' +
    'Use the available functions to interact with the Solana blockchain when needed.'
});

// Define Solana functions
async function getSOLBalance(walletAddress: string): Promise<number> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    throw error;
  }
}

async function getTokenBalances(walletAddress: string): Promise<any[]> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_PROGRAM_ID,
    });

    return Promise.all(
      tokenAccounts.value.map(async (tokenAccount) => {
        const accountData = tokenAccount.account.data.parsed.info;
        const mintAddress = accountData.mint;
        const amount = accountData.tokenAmount.uiAmount;
        
        try {
          const mintInfo = await getMint(connection, new PublicKey(mintAddress));
          return {
            mint: mintAddress,
            amount,
            decimals: mintInfo.decimals,
          };
        } catch (error) {
          return {
            mint: mintAddress,
            amount,
            decimals: accountData.tokenAmount.decimals,
          };
        }
      })
    );
  } catch (error) {
    console.error('Error getting token balances:', error);
    throw error;
  }
}

async function transferSOL(toAddress: string, amount: number): Promise<string> {
  try {
    const recipient = new PublicKey(toAddress);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: recipient,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await connection.sendTransaction(transaction, [keypair]);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error transferring SOL:', error);
    throw error;
  }
}

// Define functions that the AI can call
const functions = [
  {
    name: "getSOLBalance",
    description: "Get the SOL balance of a wallet",
    parameters: {
      type: "object",
      properties: {
        walletAddress: {
          type: "string",
          description: "The Solana wallet address"
        }
      },
      required: ["walletAddress"]
    }
  },
  {
    name: "getTokenBalances",
    description: "Get all token balances for a wallet",
    parameters: {
      type: "object",
      properties: {
        walletAddress: {
          type: "string",
          description: "The Solana wallet address"
        }
      },
      required: ["walletAddress"]
    }
  },
  {
    name: "transferSOL",
    description: "Transfer SOL from the user's wallet to another address",
    parameters: {
      type: "object",
      properties: {
        toAddress: {
          type: "string",
          description: "The recipient's Solana wallet address"
        },
        amount: {
          type: "number",
          description: "The amount of SOL to transfer"
        }
      },
      required: ["toAddress", "amount"]
    }
  }
];

// Main chat loop
async function chat() {
  console.log('🤖 Gaia + Solana Assistant Demo');
  console.log('Type "exit" to quit\n');
  
  // Display wallet information
  try {
    const balance = await getSOLBalance(keypair.publicKey.toString());
    console.log(`Your wallet address: ${keypair.publicKey.toString()}`);
    console.log(`Your SOL balance: ${balance} SOL\n`);
  } catch (error) {
    console.error('Error getting wallet information:', error);
  }
  
  // Start the conversation loop
  askQuestion();
  
  function askQuestion() {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }
      
      // Check for direct commands
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('token balance') || lowerInput.includes('token holdings')) {
        try {
          console.log('Assistant: Checking your token balances...');
          const tokenBalances = await getTokenBalances(keypair.publicKey.toString());
          console.log('Your token balances:');
          
          if (tokenBalances.length === 0) {
            console.log('You don\'t have any tokens in this wallet.');
          } else {
            tokenBalances.forEach((token) => {
              console.log(`- ${token.mint}: ${token.amount}`);
            });
          }
          
          // Add this interaction to history
          history.push({ role: 'user', content: input });
          history.push({ 
            role: 'assistant', 
            content: `I've checked your token balances. ${
              tokenBalances.length === 0 
                ? "You don't have any tokens in this wallet." 
                : `You have ${tokenBalances.length} different token(s).`
            }`
          });
          
          console.log('\n');
          askQuestion();
          return;
        } catch (error) {
          console.error('Error getting token balances:', error);
        }
      } else if (lowerInput.includes('sol balance')) {
        try {
          console.log('Assistant: Checking your SOL balance...');
          const balance = await getSOLBalance(keypair.publicKey.toString());
          console.log(`Your SOL balance: ${balance} SOL`);
          
          // Add this interaction to history
          history.push({ role: 'user', content: input });
          history.push({ 
            role: 'assistant', 
            content: `I've checked your SOL balance. You have ${balance} SOL.`
          });
          
          console.log('\n');
          askQuestion();
          return;
        } catch (error) {
          console.error('Error getting SOL balance:', error);
        }
      }
      
      try {
        // Add user message to history
        history.push({ role: 'user', content: input });
        
        console.log('Assistant: ');
        
        // Use direct OpenAI API call with function calling
        try {
          const response = await openai.chat.completions.create({
            model: process.env.GAIA_MODEL_NAME!,
            messages: history,
            functions: functions,
            function_call: "auto",
            temperature: 0.7,
          });
          
          const message = response.choices[0].message;
          const content = message.content || "";
          
          // Check if the response contains a tool call in the format <tool_call>{...}</tool_call>
          const toolCallRegex = /<tool_call>(.*?)<\/tool_call>/;
          const match = content.match(toolCallRegex);
          
          if (match) {
            try {
              const toolCallData = JSON.parse(match[1]);
              const functionName = toolCallData.name;
              const functionArgs = toolCallData.arguments || {};
              
              console.log(`Calling function from tool_call: ${functionName}`);
              
              let functionResult;
              
              // Map the tool call names to our function names
              const mappedFunctionName = 
                functionName === 'fetchTokenBalances' || functionName === 'getSolanaTokenBalances' ? 'getTokenBalances' :
                functionName === 'fetchSOLBalance' || functionName === 'getSolanaBalance' ? 'getSOLBalance' :
                functionName === 'transferSOL' || functionName === 'transferSolana' ? 'transferSOL' :
                functionName;
              
              // Execute the appropriate function
              if (mappedFunctionName === 'getSOLBalance' || functionName === 'fetchSOLBalance') {
                // Always use the user's wallet address, ignoring any placeholder
                let walletAddress = keypair.publicKey.toString();
                
                // Only use the provided address if it looks like a valid Solana address
                if (functionArgs.walletAddress && 
                    functionArgs.walletAddress !== 'your_wallet_address' && 
                    functionArgs.walletAddress.length > 30) {
                  walletAddress = functionArgs.walletAddress;
                }
                
                functionResult = await getSOLBalance(walletAddress);
                console.log(`SOL Balance: ${functionResult} SOL`);
                
                // Add the function result to the conversation
                history.push({
                  role: "function",
                  name: functionName,
                  content: JSON.stringify({ balance: functionResult })
                });
                
                // Get a new response from the AI
                const newResponse = await openai.chat.completions.create({
                  model: process.env.GAIA_MODEL_NAME!,
                  messages: history,
                  temperature: 0.7,
                });
                
                const newResponseContent = newResponse.choices[0].message.content;
                console.log(newResponseContent);
                
                // Add the AI's response to history
                if (newResponseContent) {
                  history.push({
                    role: 'assistant',
                    content: newResponseContent
                  });
                }
              } else if (mappedFunctionName === 'getTokenBalances' || functionName === 'fetchTokenBalances') {
                // Always use the user's wallet address, ignoring any placeholder
                let walletAddress = keypair.publicKey.toString();
                
                // Only use the provided address if it looks like a valid Solana address
                if (functionArgs.walletAddress && 
                    functionArgs.walletAddress !== 'your_wallet_address' && 
                    functionArgs.walletAddress.length > 30) {
                  walletAddress = functionArgs.walletAddress;
                }
                
                functionResult = await getTokenBalances(walletAddress);
                console.log(`Token Balances:`, functionResult);
                
                // Add the function result to the conversation
                history.push({
                  role: "function",
                  name: functionName,
                  content: JSON.stringify({ tokens: functionResult })
                });
                
                // Get a new response from the AI
                const newResponse = await openai.chat.completions.create({
                  model: process.env.GAIA_MODEL_NAME!,
                  messages: history,
                  temperature: 0.7,
                });
                
                const newResponseContent = newResponse.choices[0].message.content;
                console.log(newResponseContent);
                
                // Add the AI's response to history
                if (newResponseContent) {
                  history.push({
                    role: 'assistant',
                    content: newResponseContent
                  });
                }
              } else if (mappedFunctionName === 'transferSOL') {
                // For safety, we'll ask for confirmation before transferring
                const confirmTransfer = await new Promise<boolean>((resolve) => {
                  rl.question(`Confirm transfer of ${functionArgs.amount} SOL to ${functionArgs.toAddress}? (yes/no): `, (answer) => {
                    resolve(answer.toLowerCase() === 'yes');
                  });
                });
                
                if (confirmTransfer) {
                  functionResult = await transferSOL(functionArgs.toAddress, functionArgs.amount);
                  console.log(`Transfer successful: ${functionResult}`);
                  
                  // Add the function result to the conversation
                  history.push({
                    role: "function",
                    name: functionName,
                    content: JSON.stringify({ signature: functionResult })
                  });
                } else {
                  functionResult = { error: "Transfer cancelled by user" };
                  console.log(`Transfer cancelled`);
                  
                  // Add the function result to the conversation
                  history.push({
                    role: "function",
                    name: functionName,
                    content: JSON.stringify(functionResult)
                  });
                }
                
                // Get a new response from the AI
                const newResponse = await openai.chat.completions.create({
                  model: process.env.GAIA_MODEL_NAME!,
                  messages: history,
                  temperature: 0.7,
                });
                
                const newResponseContent = newResponse.choices[0].message.content;
                console.log(newResponseContent);
                
                // Add the AI's response to history
                if (newResponseContent) {
                  history.push({
                    role: 'assistant',
                    content: newResponseContent
                  });
                }
              } else {
                console.log(`Unknown function: ${functionName}`);
                
                // Just respond with a generic message
                console.log("I'm not sure how to handle that request. Could you try asking in a different way?");
                
                // Add a generic response to history
                history.push({
                  role: 'assistant',
                  content: "I'm not sure how to handle that request. Could you try asking in a different way?"
                });
              }
            } catch (parseError) {
              console.error('Error parsing tool call:', parseError);
              console.log("I encountered an error processing your request. Could you try again?");
              
              // Add error response to history
              history.push({
                role: 'assistant',
                content: "I encountered an error processing your request. Could you try again?"
              });
            }
          }
          // Standard function_call handling
          else if (message.function_call) {
            const functionName = message.function_call.name;
            const functionArgs = JSON.parse(message.function_call.arguments);
            
            console.log(`Calling function: ${functionName}`);
            
            let functionResult;
            
            // Execute the appropriate function
            if (functionName === 'getSOLBalance') {
              const walletAddress = functionArgs.walletAddress || keypair.publicKey.toString();
              functionResult = await getSOLBalance(walletAddress);
            } else if (functionName === 'getTokenBalances') {
              const walletAddress = functionArgs.walletAddress || keypair.publicKey.toString();
              functionResult = await getTokenBalances(walletAddress);
            } else if (functionName === 'transferSOL') {
              // For safety, we'll ask for confirmation before transferring
              const confirmTransfer = await new Promise<boolean>((resolve) => {
                rl.question(`Confirm transfer of ${functionArgs.amount} SOL to ${functionArgs.toAddress}? (yes/no): `, (answer) => {
                  resolve(answer.toLowerCase() === 'yes');
                });
              });
              
              if (confirmTransfer) {
                functionResult = await transferSOL(functionArgs.toAddress, functionArgs.amount);
              } else {
                functionResult = { error: "Transfer cancelled by user" };
              }
            }
            
            // Add the function result to the conversation
            history.push({
              role: "function",
              name: functionName,
              content: JSON.stringify(functionResult)
            });
            
            // Get a new response from the AI
            const newResponse = await openai.chat.completions.create({
              model: process.env.GAIA_MODEL_NAME!,
              messages: history,
              temperature: 0.7,
            });
            
            const newResponseContent = newResponse.choices[0].message.content;
            console.log(newResponseContent);
            
            // Add the AI's response to history
            if (newResponseContent) {
              history.push({
                role: 'assistant',
                content: newResponseContent
              });
            }
          } else {
            // Regular text response
            const responseContent = message.content;
            console.log(responseContent);
            
            // Add assistant response to history
            if (responseContent) {
              history.push({ 
                role: 'assistant', 
                content: responseContent 
              });
            }
          }
        } catch (error: any) {
          console.error('Error generating response:', error.message);
          if (error.response) {
            console.error('API Error:', error.response.data);
          }
        }
        
        console.log('\n');
        askQuestion();
      } catch (error: any) {
        console.error('Error:', error.message);
        askQuestion();
      }
    });
  }
}

// Start the chat
chat();