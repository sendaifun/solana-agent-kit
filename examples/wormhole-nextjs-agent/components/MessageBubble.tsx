import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolCall {
  name: string;
  args: {
    input?: string;
    sourceChain?: string;
    destinationChain?: string;
    amount?: string;
    [key: string]: unknown;
  };
  type: string;
  id: string;
}

interface SupportedChain {
  network: string;
  chain: string;
  address: string;
}

interface TokenTransferResult {
  success: boolean;
  sourceTransactionIds: string[];
  destinationTransactionIds: string[];
  transferId: {
    chain: string;
    txid: string;
  };
}

// Add interface for CCTP transfer results
interface CCTPTransferResult {
  status: string;
  message: string;
  result: {
    success: boolean;
    status: string;
    sourceChain: string;
    destinationChain: string;
    amount: string;
    sourceTransaction: string[];
    attestation: { hash: string }[];
    destinationTransaction: string[];
    automatic: boolean;
  };
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {


console.log(message)

  const isUser = message.role === 'user';
  const isJson = message.content.startsWith('{') || message.content.startsWith('[');
  
  // Check if content starts with a JSON string in double quotes
  const jsonStringMatch = message.content.match(/^"(\[.*?\])"/);
  let extractedJsonContent = '';
  
  if (jsonStringMatch && jsonStringMatch[1]) {
    extractedJsonContent = jsonStringMatch[1];
    // Unescape any escaped quotes or characters in the JSON string
    extractedJsonContent = extractedJsonContent.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    // Replace the original content with the extracted JSON for parsing
    message = {
      ...message,
      content: extractedJsonContent
    };
  }
  
  // Try to parse JSON content
  let formattedJson = '';
  let parsedContent = null;
  let isToolCall = false;
  let isToolResponse = false;
  let toolName = '';
  let isSupportedChains = false;
  let isCCTPTransfer = false;
  
  if (isJson || extractedJsonContent) {
    try {
        parsedContent = JSON.parse(message.content);
        
        console.log(parsedContent)

      formattedJson = JSON.stringify(parsedContent, null, 2);
      
      // Check if this is a tool call
      if (Array.isArray(parsedContent) && 
          parsedContent.length > 0 && 
          parsedContent[0].type === 'tool_call') {
        isToolCall = true;
        toolName = parsedContent[0].name;
      }
      
      // Check if this is a tool response
      if (!isToolCall && !isUser) {
        isToolResponse = true;
      }
      
      // Check if this is supported chains data
      if (Array.isArray(parsedContent) && 
          parsedContent.length > 0 && 
          'network' in parsedContent[0] && 
          'chain' in parsedContent[0] && 
          'address' in parsedContent[0]) {
        isSupportedChains = true;
      }

      // Check if this is a CCTP transfer result
      if (!isToolCall && !isUser && 
          typeof parsedContent === 'object' && 
          parsedContent !== null &&
          'status' in parsedContent && 
          'result' in parsedContent && 
          typeof parsedContent.result === 'object' &&
          'sourceChain' in parsedContent.result &&
          'destinationChain' in parsedContent.result) {
        isCCTPTransfer = true;
      }
    } catch (e) {
      // If parsing fails, we'll display as regular text
      console.error('Failed to parse JSON message:', e);
    }
  }

  // Render supported chains in a grid
  const renderSupportedChains = (chains: SupportedChain[]) => {
    // Group chains by network
    const networkGroups: { [key: string]: SupportedChain[] } = {};
    chains.forEach(chain => {
      if (!networkGroups[chain.network]) {
        networkGroups[chain.network] = [];
      }
      networkGroups[chain.network].push(chain);
    });

    // Function to handle copying address to clipboard
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      // In a real implementation, you might want to show a toast notification here
    };

    return (
      <div className="mt-2 p-4 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center mb-4">
          <div className="w-5 h-5 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">Supported Chains</span>
        </div>
        
        {Object.entries(networkGroups).map(([network, chains]) => (
          <div key={network} className="mb-6">
            <div className="flex items-center mb-3 border-l-4 border-blue-400 dark:border-blue-600 pl-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-r-full">
                <h3 className="font-bold text-md text-blue-700 dark:text-blue-300">{network}</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              {chains.map((chain, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
                >
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-300">{chain.chain.substring(0, 2)}</span>
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{chain.chain}</div>
                  </div>
                  <div 
                    className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono overflow-hidden text-ellipsis flex items-center" 
                    title={chain.address}
                  >
                    <span className="truncate">{chain.address}</span>
                    <button 
                      className="ml-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 focus:outline-none transition-colors duration-200" 
                      onClick={() => copyToClipboard(chain.address)}
                      title="Copy address to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render token transfer result
  const renderTokenTransfer = (result: TokenTransferResult) => {
    return (
      <div className="mt-2 border rounded-lg overflow-hidden">
        <div className="bg-green-600 dark:bg-green-700 p-3 flex items-center">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-white">Transfer Successful</span>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Source Transaction:</div>
              <div className="text-xs break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-md font-mono border border-gray-200 dark:border-gray-600">
                {result.sourceTransactionIds[0]}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Destination Transaction:</div>
              <div className="text-xs break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-md font-mono border border-gray-200 dark:border-gray-600">
                {result.destinationTransactionIds[0]}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Transfer from {result.transferId.chain} completed
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render CCTP transfer result
  const renderCCTPTransfer = (data: CCTPTransferResult) => {
    const { result } = data;
    
    return (
      <div className="mt-2 border rounded-lg overflow-hidden">
        <div className="bg-purple-600 dark:bg-purple-700 p-3 flex items-center">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-white">CCTP Transfer Successful</span>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Source Chain</div>
                <div className="text-md font-bold">{result.sourceChain}</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Destination Chain</div>
                <div className="text-md font-bold">{result.destinationChain}</div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Amount</div>
              <div className="text-xl font-bold">{result.amount} USDC</div>
            </div>
            
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Source Transaction:</div>
              <div className="text-xs break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-md font-mono border border-gray-200 dark:border-gray-600">
                {result.sourceTransaction[0]}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Attestation Hash:</div>
              <div className="text-xs break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-md font-mono border border-gray-200 dark:border-gray-600">
                {result.attestation[0].hash}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Destination Transaction:</div>
              <div className="text-xs break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-md font-mono border border-gray-200 dark:border-gray-600">
                {result.destinationTransaction[0]}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              CCTP Transfer completed with status: {result.status}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render tool call
  const renderToolCall = (toolCall: ToolCall[]) => {
    const call = toolCall[0];
    const formattedName = call.name.replace(/_/g, ' ');
    
    return (
      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden shadow-md">
        <div className="bg-gray-700 dark:bg-gray-800 p-3 flex items-center border-b border-gray-600">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-pulse mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-white capitalize">Processing: {formattedName}</span>
        </div>
        
        <div className="p-3 text-white">
          {call.name === 'get_supported_chains' && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Retrieving supported chains...
            </div>
          )}
          {call.name === 'token_transfer' && (
            <div>
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transferring tokens with parameters:
              </div>
              {call.args.input && (
                <div className="bg-gray-900 dark:bg-black border border-gray-700 rounded-md p-3 mt-2 text-xs overflow-auto font-mono text-green-300">
                  {JSON.stringify(JSON.parse(call.args.input), null, 2)}
                </div>
              )}
            </div>
          )}
          {call.name === 'cctp_transfer' && (
            <div>
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transferring USDC with parameters:
              </div>
              {call.args.input ? (
                <div className="bg-gray-900 dark:bg-black border border-gray-700 rounded-md p-3 mt-2 text-xs overflow-auto font-mono text-purple-300">
                  {JSON.stringify(JSON.parse(call.args.input), null, 2)}
                </div>
              ) : call.args.sourceChain && call.args.destinationChain ? (
                <div className="bg-gray-900 dark:bg-black border border-gray-700 rounded-md p-3 mt-2 text-xs overflow-auto font-mono text-purple-300">
                  {JSON.stringify({
                    sourceChain: call.args.sourceChain,
                    destinationChain: call.args.destinationChain,
                    amount: call.args.amount || "unknown",
                    ...call.args
                  }, null, 2)}
                </div>
              ) : (
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-yellow-300">Processing CCTP transfer...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      {!isUser && (
        <Avatar className="h-10 w-10 mr-3 mt-1">
          <AvatarImage src="/wormhole-brand-icon.svg" alt="Wormhole Agent" />
          <AvatarFallback>WH</AvatarFallback>
        </Avatar>
      )}
      
      <Card className={`max-w-[85%] ${isUser ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700'}`}>
        <CardContent className={`p-4 ${isToolCall || (isToolResponse && (parsedContent && ('success' in parsedContent || toolName === 'get_supported_chains' || isSupportedChains || isCCTPTransfer))) ? 'p-0 overflow-hidden' : ''}`}>
          {isToolCall && parsedContent ? (
            renderToolCall(parsedContent as ToolCall[])
          ) : isSupportedChains ? (
            renderSupportedChains(parsedContent as SupportedChain[])
          ) : isToolResponse && parsedContent && toolName === 'get_supported_chains' ? (
            renderSupportedChains(parsedContent as SupportedChain[])
          ) : isToolResponse && parsedContent && 'success' in parsedContent && 'sourceTransactionIds' in parsedContent ? (
            renderTokenTransfer(parsedContent as TokenTransferResult)
          ) : isCCTPTransfer && parsedContent ? (
            renderCCTPTransfer(parsedContent as CCTPTransferResult)
          ) : isJson && formattedJson ? (
            <pre className="text-xs overflow-auto max-h-[400px] whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              {formattedJson}

            </pre>
          ) : (
                                          <div className="whitespace-pre-wrap break-words">
                                              
                                              {message.content}
                                          
                                          </div>
          )}
        </CardContent>
      </Card>
      
      {isUser && (
        <Avatar className="h-10 w-10 ml-3 mt-1">
          <AvatarImage src="/globe.svg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
