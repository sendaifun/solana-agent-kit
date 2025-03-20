export const ChatInput = ({ 
  input, 
  setInput, 
  handleSubmit, 
  isLoading 
}: { 
  input: string; 
  setInput: (input: string) => void; 
  handleSubmit: (e: React.FormEvent) => Promise<void>; 
  isLoading: boolean;
}) => (
  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-black">
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about Wormhole cross-chain operations..."
        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black text-black dark:text-white"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-[var(--yellow)] text-black rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  </div>
);
