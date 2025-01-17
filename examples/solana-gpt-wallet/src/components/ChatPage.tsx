'use client'

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";


export default function ChatPage() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
        
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto text-blue-400" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Solana GPT Wallet
          </h1>
          <p className="text-gray-400">
            What transaction would you like to perform?
          </p>
        </div>


      <div className="fixed bottom-8 w-full max-w-2xl mx-auto px-4">
        <form className="flex gap-2">
          <Input
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 rounded-full h-12"
          />
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 h-12"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
