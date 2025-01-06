export default function ChatBubble({text, role }){
    return (
        <div className={`border border-indigo-300 w-[85%] md:w-[50%] rounded-md p-3 bg-indigo-100 ${role === "user" ? "self-end w-[60%] md:w-[45%] rounded-br-none": "rounded-bl-none"}`}>
            <p className="text-slate-600 text-sm">{role === "assistant" ? "Solana AI Agent" : "User"}</p>
            <p className="text-slate-800">{text}</p>
        </div>
    )
}