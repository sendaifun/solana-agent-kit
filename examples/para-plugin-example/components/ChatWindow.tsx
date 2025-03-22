'use client';

import { useChat } from 'ai/react';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Message } from 'ai';
import { toast, Toaster } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { ParaCore } from '@getpara/react-sdk';
import {solanaAgentWithPara} from '@/utils/init'
import { useWalletWeb } from '@/utils/use_wallet';

const LoadingSpinner = () => (
  <div className="flex items-center space-x-2 text-gray-400 text-sm">
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-gray-400"></div>
    <span>AI is thinking...</span>
  </div>
);

interface ToolCall {
  type: string;
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
}

interface ToolResult {
  toolCallId: string;
  result: Record<string, any>;
}

interface StreamFinish {
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  isContinued?: boolean;
}

interface ToolInvocation {
  type: string;
  toolName: string;
  args?: Record<string, any>;
  state?: string;
  result?: Record<string, any>;
}

interface ExtendedMessage extends Omit<Message, 'toolCalls' | 'toolInvocations'> {
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  text?: string;
  finish?: StreamFinish;
  toolInvocations?: ToolInvocation[];
}

interface ChatWindowProps {
  endpoint: string;
  emoji: string;
  titleText: string;
  placeholder?: string;
  emptyStateComponent: ReactNode;
  para?:ParaCore;
}

export const ChatWindow: FC<ChatWindowProps> = ({
  endpoint,
  emoji,
  titleText,
  placeholder = "Send a message...",
  emptyStateComponent,
  para
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  
  const { messages: chatMessages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: endpoint,
    onError: (error) => {
      // let errorMessage = "An error occurred while processing your request.";
      console.log(error);
      // try {
      //   const parsedError = JSON.parse(error.message);
      //   errorMessage = parsedError.error || error.message;
      // } catch {
      //   errorMessage = error.message;
      // }
      toast.error(error.message as any);
    },
    onResponse: (response) => {
      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
      }
    },
    onFinish: async (message: any) => {
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        
        if (lastMessage) {
          const extendedMessage: ExtendedMessage = {
            id: lastMessage.id,
            role: lastMessage.role,
            content: message.content || lastMessage.content || "",
            createdAt: lastMessage.createdAt,
            toolInvocations: lastMessage.toolInvocations || [],
            toolResults: message.toolResults || lastMessage.toolResults || [],
            finish: message.finish
          };
          
          return [...updatedMessages.slice(0, -1), extendedMessage];
        }
       
        return updatedMessages;
      });

      // Handle async tool invocations separately
      if (message.toolInvocations?.length > 0) {
 
        const processedInvocations = await Promise.all(
          message.toolInvocations.map(async (invocation: ToolInvocation) => {
            if (invocation.toolName === 'GET_ALL_WALLETS') {
              try {
                
                const wallets = await solanaAgentWithPara.methods.getAllWallets();
                return {
                  ...invocation,
                  result: { status: 'success', wallets }
                };
              } catch (error) {
                return {
                  ...invocation,
                  result: { status: 'error', message: (error as Error).message }
                };
              }
            }
            if (invocation.toolName === '0') {
            //  console.log(invocation.result)
             try {
              // Save user share data to our API
              const response = await fetch('/api/usershare', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: invocation.result?.email,
                  userShare: invocation.result?.userShare
                })
              });

              if (!response.ok) {
                throw new Error('Failed to save user share data');
              }

              return {
                ...invocation,
                result: { 
                  status: 'success', 
                  ...invocation.result 
                }
              };
            } catch (error) {
              console.error('Error saving user share data:', error);
              return {
                ...invocation,
                result: { 
                  status: 'error', 
                  message: (error as Error).message,
                  ...invocation.result 
                }
              };
            }
            }
            //  
            if (invocation.toolName === 'CLAIM_PARA_PREGEN_WALLET') {
              //     const userShare="eyJjcmVhdGVkQXQiOiIyMDI1LTAzLTE4VDAyOjIwOjMwLjE5NloiLCJ1cGRhdGVkQXQiOiIyMDI1LTAzLTE4VDAyOjIwOjMyLjc5N1oiLCJpZCI6IjU5OWMyZWU2LWExZDgtNDZlYy1hY2ZjLTBlM2FkZjcyNWU5OSIsInVzZXJJZCI6bnVsbCwibmFtZSI6bnVsbCwia2V5R2VuQ29tcGxldGUiOnRydWUsImFkZHJlc3MiOiJETnhKS1pIckFSdmU1aFl5U3U1dGU4RlZxQmkyVlZ6UXJ3ZE5GUDZCbnNIZiIsImFkZHJlc3NTZWNvbmRhcnkiOm51bGwsInB1YmxpY0tleSI6IiIsImNvc21vc1ByZWZpeCI6bnVsbCwic2NoZW1lIjoiRUQyNTUxOSIsImlzUHJlZ2VuIjp0cnVlLCJ0eXBlIjoiU09MQU5BIiwicHJlZ2VuSWRlbnRpZmllciI6InBvbmNpQHRlc3QuZ2V0cGFyYS5jb20iLCJwcmVnZW5JZGVudGlmaWVyVHlwZSI6IkVNQUlMIiwicGFydG5lcklkIjoiOGY2MTE2MDktZDFjNS00YmU3LTlhMTUtMjE2NjQ5ZDk4M2ExIiwiY3VzdG9tQXV0aElkSWQiOm51bGwsImxhc3RVc2VkQXQiOm51bGwsImxhc3RVc2VkUGFydG5lcklkIjpudWxsLCJoYXNCZWVuVXNlZENyb3NzUGFydG5lciI6ZmFsc2UsInBhcnRuZXIiOnsiY3JlYXRlZEF0IjoiMjAyNS0wMS0yNFQxMzoxNTo1Ni40MDJaIiwidXBkYXRlZEF0IjoiMjAyNS0wMi0yNlQwNzo1NDo0NS4xODBaIiwiaWQiOiI4ZjYxMTYwOS1kMWM1LTRiZTctOWExNS0yMTY2NDlkOTgzYTEiLCJuYW1lIjoic29sYW5hIiwib3JnYW5pemF0aW9uSWQiOiJkZjVhN2Q2YS1jMDk1LTQyMDYtYWE1ZS05Mjc2ZjA2YjhkOWMiLCJwcm9qZWN0SWQiOiIxODFiZjg5OS1kZTE2LTQ3OWYtYjk4Mi1hZjQ1MWE0YTI1NGMiLCJkaXNwbGF5TmFtZSI6InNvbGFuYSIsImJhbm5lckltYWdlVXJsIjpudWxsLCJ2ZXJpZnlVcmwiOm51bGwsInBvcnRhbFVybCI6bnVsbCwiaG9tZXBhZ2VVcmwiOiJodHRwczovL21hbnRsZS51cmF0bWFuZ3VuLm92aCIsInBvcnRhbEhlYWRlckxvZ29VcmwiOm51bGwsImFwaUtleSI6IjUwMDZlMGMwZGU5MjhjYjA1MzA1ZDEyNDk0Yjc1ZmI0IiwicG9saWNpZXNFbmFibGVkIjpmYWxzZSwib3JpZ2lucyI6bnVsbCwibWl4cGFuZWxUb2tlbiI6bnVsbCwibG9nb1VybCI6bnVsbCwiZW1haWxCYWNrdXBLaXQiOmZhbHNlLCJlbWFpbFdlbGNvbWUiOnRydWUsImVtYWlsSW1hZ2VVcmwiOm51bGwsImVtYWlsSW1hZ2VMaW5rIjpudWxsLCJiYWNrZ3JvdW5kQ29sb3IiOm51bGwsImZvcmVncm91bmRDb2xvciI6bnVsbCwiZm9udCI6bnVsbCwidHdpdHRlclVybCI6bnVsbCwiZ2l0aHViVXJsIjpudWxsLCJsaW5rZWRpblVybCI6bnVsbCwiYXJjaGl2ZWQiOmZhbHNlLCJpc1VzZWQiOnRydWUsImlzSW5zdGFsbGVkIjp0cnVlLCJzdXBwb3J0ZWRXYWxsZXRUeXBlcyI6W3sidHlwZSI6IlNPTEFOQSIsIm9wdGlvbmFsIjpmYWxzZX0seyJ0eXBlIjoiRVZNIiwib3B0aW9uYWwiOmZhbHNlfV0sImNvc21vc1ByZWZpeCI6ImNvc21vcyIsImlzV2l0aGRyYXdFbmFibGVkIjp0cnVlLCJpc0J1eUVuYWJsZWQiOnRydWUsImlzUmVjZWl2ZUVuYWJsZWQiOnRydWUsIm9uUmFtcFByb3ZpZGVycyI6WyJTVFJJUEUiLCJNT09OUEFZIl0sIm9uUmFtcEFzc2V0cyI6bnVsbCwidGVhbUlkIjpudWxsLCJidW5kbGVJZGVudGlmaWVyIjpudWxsLCJhbmRyb2lkUGFja2FnZU5hbWUiOm51bGwsImFuZHJvaWRTaGEyNTZDZXJ0RmluZ2VycHJpbnRzIjpudWxsLCJhY2NlbnRDb2xvciI6bnVsbCwidGhlbWVNb2RlIjoiTElHSFQiLCJzdXBwb3J0ZWRBdXRoTWV0aG9kcyI6WyJQQVNTS0VZIl0sImljb25VcmwiOm51bGwsInJhbXBBcGlLZXkiOm51bGwsImRlZmF1bHRPblJhbXBBc3NldCI6bnVsbCwiZGVmYXVsdE9uUmFtcE5ldHdvcmsiOm51bGwsImRlZmF1bHRCdXlBbW91bnQiOm51bGwsImRlZmF1bHRCdXlBbW91bnRDdXJyZW5jeSI6bnVsbCwiZGVmYXVsdFNlbGxBbW91bnQiOm51bGwsImRlZmF1bHRTZWxsQW1vdW50Q3VycmVuY3kiOm51bGwsImZvcmNlVHJhbnNhY3Rpb25Qb3B1cHMiOmZhbHNlLCJ0cmFuc2FjdGlvblBvcHVwc0VuYWJsZWQiOmZhbHNlfSwibGFzdFVzZWRQYXJ0bmVyIjpudWxsLCJzaWduZXIiOiJleUpKWkNJNklqRWlMQ0pQZEdobGNrbGtJam9pTWlJc0lrOTFkSEIxZENJNmV5SlFkV0pzYVdNaU9uc2lkQ0k2TVN3aVozSnZkWEJyWlhraU9pSjZTR1ZQTTFOeVIzZHlZVTFOTmpSQ1F5OXJUREZUZGxsbE4zaGhTRUZEYjNkQ1pHdEZWMDFCVVRGUlBTSXNJbk5vWVhKbGN5STZleUl4SWpvaVZITXllbVZGVEZkcVFXbzRWRlJ1Wm1sV09IYzRZMWcyT1VzdlpqWkROVWhQUXpWQlkyRnRiRlJxWnowaUxDSXlJam9pUkdoM1JrZzROM05US3poeFdWRkpUSGd3VVVoMUt6ZFRUMWx3YzJ3cmVXMHJTbFZtSzJ4TE0zbFRPRDBpZlgwc0lsTmxZM0psZEV0bGVTSTZleUpwWkNJNk1Td2ljMlZqY21WMElqb2libGNyTDNaSk9FazVPWEZDYkZKMWJXZ3dhMlZXWnpkalR6Z3pXV3g0Y3paeldEQkVXRzVTVmpCQll6MGlmWDBzSWxkaGJHeGxkRWxrSWpvaU5UazVZekpsWlRZdFlURmtPQzAwTm1WakxXRmpabU10TUdVellXUm1OekkxWlRrNUlpd2lTRzl6ZENJNkluZHpjem92TDIxd1l5MXVaWFIzYjNKckxtSmxkR0V1WjJWMGNHRnlZUzVqYjIwaWZRPT0ifQ==";
           
              // const claim=await solanaAgentWithPara.methods.claimParaPregenWallet(userShare,"")
              
              // return {
              //   ...invocation,
              //   result: { status: 'success', ...claim }
              // };
              try {
                // Save user share data to our API
                const response = await fetch('/api/usershare?email='+invocation.args?.email, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
   
                if (!response.ok) {
                  throw new Error('Failed to get user share data');
                }
                const data = await response.json();
                //  const userShare="eyJjcmVhdGVkQXQiOiIyMDI1LTAzLTE4VDAyOjE0OjIyLjI0M1oiLCJ1cGRhdGVkQXQiOiIyMDI1LTAzLTE4VDAyOjE0OjI1LjI4MFoiLCJpZCI6ImQ5Nzg4MWUxLTA0ZTQtNGJhYS04MjYyLTc1NDdmYjVhZTU2MCIsInVzZXJJZCI6bnVsbCwibmFtZSI6bnVsbCwia2V5R2VuQ29tcGxldGUiOnRydWUsImFkZHJlc3MiOiI5VzU1Q29jU3RQb0xqMXppN3JZWXdtaTNFSHY1QTkzTWNiQXpidWc3U0c2NiIsImFkZHJlc3NTZWNvbmRhcnkiOm51bGwsInB1YmxpY0tleSI6IiIsImNvc21vc1ByZWZpeCI6bnVsbCwic2NoZW1lIjoiRUQyNTUxOSIsImlzUHJlZ2VuIjp0cnVlLCJ0eXBlIjoiU09MQU5BIiwicHJlZ2VuSWRlbnRpZmllciI6InBvbmNpQHRlc3QuZ2V0cGFyYS5jb20iLCJwcmVnZW5JZGVudGlmaWVyVHlwZSI6IkVNQUlMIiwicGFydG5lcklkIjoiOGY2MTE2MDktZDFjNS00YmU3LTlhMTUtMjE2NjQ5ZDk4M2ExIiwiY3VzdG9tQXV0aElkSWQiOm51bGwsImxhc3RVc2VkQXQiOm51bGwsImxhc3RVc2VkUGFydG5lcklkIjpudWxsLCJoYXNCZWVuVXNlZENyb3NzUGFydG5lciI6ZmFsc2UsInBhcnRuZXIiOnsiY3JlYXRlZEF0IjoiMjAyNS0wMS0yNFQxMzoxNTo1Ni40MDJaIiwidXBkYXRlZEF0IjoiMjAyNS0wMi0yNlQwNzo1NDo0NS4xODBaIiwiaWQiOiI4ZjYxMTYwOS1kMWM1LTRiZTctOWExNS0yMTY2NDlkOTgzYTEiLCJuYW1lIjoic29sYW5hIiwib3JnYW5pemF0aW9uSWQiOiJkZjVhN2Q2YS1jMDk1LTQyMDYtYWE1ZS05Mjc2ZjA2YjhkOWMiLCJwcm9qZWN0SWQiOiIxODFiZjg5OS1kZTE2LTQ3OWYtYjk4Mi1hZjQ1MWE0YTI1NGMiLCJkaXNwbGF5TmFtZSI6InNvbGFuYSIsImJhbm5lckltYWdlVXJsIjpudWxsLCJ2ZXJpZnlVcmwiOm51bGwsInBvcnRhbFVybCI6bnVsbCwiaG9tZXBhZ2VVcmwiOiJodHRwczovL21hbnRsZS51cmF0bWFuZ3VuLm92aCIsInBvcnRhbEhlYWRlckxvZ29VcmwiOm51bGwsImFwaUtleSI6IjUwMDZlMGMwZGU5MjhjYjA1MzA1ZDEyNDk0Yjc1ZmI0IiwicG9saWNpZXNFbmFibGVkIjpmYWxzZSwib3JpZ2lucyI6bnVsbCwibWl4cGFuZWxUb2tlbiI6bnVsbCwibG9nb1VybCI6bnVsbCwiZW1haWxCYWNrdXBLaXQiOmZhbHNlLCJlbWFpbFdlbGNvbWUiOnRydWUsImVtYWlsSW1hZ2VVcmwiOm51bGwsImVtYWlsSW1hZ2VMaW5rIjpudWxsLCJiYWNrZ3JvdW5kQ29sb3IiOm51bGwsImZvcmVncm91bmRDb2xvciI6bnVsbCwiZm9udCI6bnVsbCwidHdpdHRlclVybCI6bnVsbCwiZ2l0aHViVXJsIjpudWxsLCJsaW5rZWRpblVybCI6bnVsbCwiYXJjaGl2ZWQiOmZhbHNlLCJpc1VzZWQiOnRydWUsImlzSW5zdGFsbGVkIjp0cnVlLCJzdXBwb3J0ZWRXYWxsZXRUeXBlcyI6W3sidHlwZSI6IlNPTEFOQSIsIm9wdGlvbmFsIjpmYWxzZX0seyJ0eXBlIjoiRVZNIiwib3B0aW9uYWwiOmZhbHNlfV0sImNvc21vc1ByZWZpeCI6ImNvc21vcyIsImlzV2l0aGRyYXdFbmFibGVkIjp0cnVlLCJpc0J1eUVuYWJsZWQiOnRydWUsImlzUmVjZWl2ZUVuYWJsZWQiOnRydWUsIm9uUmFtcFByb3ZpZGVycyI6WyJTVFJJUEUiLCJNT09OUEFZIl0sIm9uUmFtcEFzc2V0cyI6bnVsbCwidGVhbUlkIjpudWxsLCJidW5kbGVJZGVudGlmaWVyIjpudWxsLCJhbmRyb2lkUGFja2FnZU5hbWUiOm51bGwsImFuZHJvaWRTaGEyNTZDZXJ0RmluZ2VycHJpbnRzIjpudWxsLCJhY2NlbnRDb2xvciI6bnVsbCwidGhlbWVNb2RlIjoiTElHSFQiLCJzdXBwb3J0ZWRBdXRoTWV0aG9kcyI6WyJQQVNTS0VZIl0sImljb25VcmwiOm51bGwsInJhbXBBcGlLZXkiOm51bGwsImRlZmF1bHRPblJhbXBBc3NldCI6bnVsbCwiZGVmYXVsdE9uUmFtcE5ldHdvcmsiOm51bGwsImRlZmF1bHRCdXlBbW91bnQiOm51bGwsImRlZmF1bHRCdXlBbW91bnRDdXJyZW5jeSI6bnVsbCwiZGVmYXVsdFNlbGxBbW91bnQiOm51bGwsImRlZmF1bHRTZWxsQW1vdW50Q3VycmVuY3kiOm51bGwsImZvcmNlVHJhbnNhY3Rpb25Qb3B1cHMiOmZhbHNlLCJ0cmFuc2FjdGlvblBvcHVwc0VuYWJsZWQiOmZhbHNlfSwibGFzdFVzZWRQYXJ0bmVyIjpudWxsLCJzaWduZXIiOiJleUpKWkNJNklqRWlMQ0pQZEdobGNrbGtJam9pTWlJc0lrOTFkSEIxZENJNmV5SlFkV0pzYVdNaU9uc2lkQ0k2TVN3aVozSnZkWEJyWlhraU9pSlNTRlpPWWtkd2RXWkZWM3AzV2xCcFlsSnliR05TUkhjeGQyTlVialJLUjFsbllqVlZNMGxWUkhkVlBTSXNJbk5vWVhKbGN5STZleUl4SWpvaVprcElSRGd5YkUwNEx6RmhkRTVpYlU0d1NDdFNZVkZxVG5weVJYWXJTRWx4UWl0WGRGb3JjVTVJUlQwaUxDSXlJam9pYUV4UFRUUTRUVzk2Wkd4UFkwdFhaWFp0V1hkRGJFNWhha0oxVm10blMybFZTSGxQVUV4VWRHcDVVVDBpZlgwc0lsTmxZM0psZEV0bGVTSTZleUpwWkNJNk1Td2ljMlZqY21WMElqb2llRWRTVWpsSU9UZFZZVEZVYld3d09XOVdSSE5EUzJNeFFYUm5kVTFOUVhaclVISnNVelkyVjB4UmF6MGlmWDBzSWxkaGJHeGxkRWxrSWpvaVpEazNPRGd4WlRFdE1EUmxOQzAwWW1GaExUZ3lOakl0TnpVME4yWmlOV0ZsTlRZd0lpd2lTRzl6ZENJNkluZHpjem92TDIxd1l5MXVaWFIzYjNKckxtSmxkR0V1WjJWMGNHRnlZUzVqYjIwaWZRPT0ifQ==";
           
              const claim=await solanaAgentWithPara.methods.claimParaPregenWallet(data.userShare,"")
              // Delete user share data
              const deleteResponse = await fetch('/api/usershare?email=' + invocation.args?.email, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (!deleteResponse.ok) {
                throw new Error('Failed to delete user share data');
              }
              return {
                ...invocation,
                result: { status: 'success', ...claim }
              };
                
              } catch (error) {
                console.error('Error getting user share data:', error);
                return {
                
                  result: { 
                    status: 'error', 
                    message: (error as Error).message,
                  
                  }
                };
              }
            
            }
            if (invocation.toolName === 'USE_WALLET') {
              
              try {
                // Pass empty object cast to SolanaAgentKit as first parameter since it will be replaced by the bound agent
                const response = await useWalletWeb(invocation.args?.walletId as string);
                
               
                return {
                  ...invocation,
                  result: { status: 'success', ...response }
                };
              } catch (error) {
                console.log(error);
                return {
                  ...invocation,
                  result: { status: 'error', message: (error as Error).message }
                };
              }
            }
            return invocation;
          })
        );

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          
          if (lastMessage) {
            const extendedMessage: ExtendedMessage = {
              ...lastMessage,
              toolInvocations: processedInvocations
            };
            
            return [...updatedMessages.slice(0, -1), extendedMessage];
          }
          
          return updatedMessages;
        });
      }
    
    }
  });

  // Sync our state with chat messages when they change
  useEffect(() => {
    if (chatMessages.length > messages.length) {
      // New message added
      const newMessages = chatMessages.slice(messages.length);
      setMessages(prev => [...prev, ...newMessages as ExtendedMessage[]]);
    }
  }, [chatMessages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "end",
        });
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]); // Changed from chatMessages to messages

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  const renderMessage = (message: ExtendedMessage) => {
    const isAssistant = message.role === "assistant";
    const messageTime = new Date().toLocaleTimeString();
    
    return (
      <div className={`flex flex-col ${isAssistant ? "items-start" : "items-end"} w-full`}>
        <div className="flex items-center mb-1 text-xs text-gray-400">
          <span>{isAssistant ? "AI Assistant" : "You"}</span>
          <span className="mx-2">•</span>
          <span>{messageTime}</span>
        </div>
        <div className={`rounded-lg px-4 py-3 max-w-[85%] shadow-md ${
          isAssistant 
            ? "bg-gray-700 text-white border border-gray-600" 
            : "bg-blue-600 text-white"
        }`}>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{message.content || message.text || ''}</ReactMarkdown>
          </div>
          
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 border-t border-gray-600 pt-3">
              <div className="text-sm font-medium text-gray-300">Tools Called:</div>
              {message.toolCalls.map((tool, index) => (
                <div key={`${tool.toolCallId}-${index}`} className="mt-2 bg-gray-800 rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-medium">{tool.toolName}</span>
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">{tool.toolCallId}</span>
                  </div>
                  <div className="text-xs text-gray-300 mb-1">Arguments:</div>
                  <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(tool.args, null, 2)}
                  </pre>
                  
                  {message.toolResults?.find(result => result.toolCallId === tool.toolCallId) && (
                    <div className="mt-2 border-l-2 border-blue-500 pl-3">
                      <div className="text-xs font-medium text-gray-300">Result:</div>
                      <pre className="mt-1 text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(
                          message.toolResults.find(
                            result => result.toolCallId === tool.toolCallId
                          )?.result,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="mt-3 border-t border-gray-600 pt-3">
              <div className="text-sm font-medium text-gray-300">Tool Invocations:</div>
              {message.toolInvocations.map((invocation, index) => (
                <div key={index} className="mt-2 bg-gray-800 rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-medium">{invocation.type || 'function_call'}</span>
                    {invocation.toolName && (
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                        {invocation.toolName}
                      </span>
                    )}
                    {invocation.state && (
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                        {invocation.state}
                      </span>
                    )}
                  </div>
                  {invocation.args && (
                    <>
                      <div className="text-xs text-gray-300 mb-1">Arguments:</div>
                      <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(invocation.args, null, 2)}
                      </pre>
                    </>
                  )}
                  {invocation.result  && (
                    <div className="mt-2 border-l-2 border-blue-500 pl-3">
                      <div className="text-xs font-medium text-gray-300">Result:</div>
                      <pre className="mt-1 text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(invocation.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {message.finish && (
            <div className="mt-2 text-xs text-gray-400 border-t border-gray-600 pt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span>Status: {message.finish.finishReason}</span>
                <span>•</span>
                <span>Total Tokens: {message.finish.usage.promptTokens + message.finish.usage.completionTokens}</span>
              </div>
              {message.finish.isContinued && (
                <div className="text-yellow-400">
                  Note: This response was continued from a previous message
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center p-4 md:p-8 rounded bg-[#25252d] w-full h-full overflow-hidden">
      
      <Toaster position="top-center" richColors />
      
      <div className="flex w-full items-center justify-between pb-4 border-b border-gray-600 mb-4">
        <div className="flex items-center">
          
          <div className="mr-2 text-2xl">{emoji}</div>
          <h2 className="text-2xl font-bold">{titleText}</h2>
        </div>
        {isLoading && <LoadingSpinner />}
      </div>

      <div 
        ref={messagesContainerRef}
        className="flex-1 w-full overflow-y-auto mb-4 relative pb-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.length > 0 ? (
          messages.map((message, i) => (
            <div
              key={`${message.id || i}-${message.role}`}
              className={`flex flex-col mb-4 ${
                message.role === "assistant" ? "items-start" : "items-end"
              }`}
            >
              {renderMessage(message)}
            </div>
          ))
        ) : (
          <div className="flex-1 w-full">{emptyStateComponent}</div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={input}
          placeholder={isLoading ? "Waiting for response..." : placeholder}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`px-4 py-2 rounded-r-lg bg-blue-600 text-white font-semibold flex items-center justify-center min-w-[80px]
            ${
              isLoading || !input.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}; 