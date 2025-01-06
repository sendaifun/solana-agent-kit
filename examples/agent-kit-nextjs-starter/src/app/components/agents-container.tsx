import Link from "next/link"

export default function Agents() {
    const agents = [
    {
        name: 'Deploy SPL tokens by Metaplex',
        desc: "Easily deploy and manage SPL tokens on the Solana blockchain using Metaplex tools."
    },
    {
        name: 'Transfer assets',
        desc: "Quickly transfer digital assets such as tokens between Solana wallets with minimal effort."
    },
    {
        name: 'Balance checks',
        desc: "Check real-time balances of your Solana wallet, including SOL and SPL tokens."
    },
    {
        name: 'Stake SOL',
        desc: "Stake your SOL tokens to earn rewards and support the Solana network."
    },
    {
        name: 'Create NFT Collection',
        desc: "Design and deploy a custom NFT collection with metadata and unique properties."
    },
    {
        name: 'Swap Tokens',
        desc: "Swap between SPL tokens directly on the Solana blockchain for seamless trading."
    },
];
 
    return (
        <div className="flex w-full mx-auto flex-col gap-8 items-center justify-center py-12 px-10">
            <div className="rounded-full p-1 border border-white px-2"> ⚡Explore our top features</div>
            <h1 className="text-white text-4xl font-bold text-center">Key Features of the Solana Agent Kit</h1>
            <p className="text-sm md:px-[20%] text-center text-indigo-200">The repository includes an advanced example of building a multi-agent system using LangGraph and Solana Agent Kit. Located in examples/agent-kit-langgraph, this example demonstrates:</p>
            <div className="flex w-full flex-wrap gap-8 items-center justify-center">
            {agents.map(agent => 
                <div className="w-[350px] h-[200px] border rounded-md border-white flex flex-col gap-2 p-4 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 bg-purple-950 justify-between transform transition duration-500 hover:scale-110">
                    <h3 className="text-2xl font-bold">{agent.name}</h3>
                    <p className="text-sm text-indigo-200">{agent.desc}</p>
                    <Link href="/chatscreen" className="text-right text-blue-200">{'Use agent >'}</Link>
                </div>
            )}
            </div>
        </div>
    )
}