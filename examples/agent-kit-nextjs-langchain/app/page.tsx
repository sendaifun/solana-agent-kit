import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
	const InfoCard = (
		<div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
			<h1 className="text-3xl md:text-4xl mb-4">
				SolanaAgentKit + LangChain.js 🦜🔗 + Next.js
			</h1>
			<ul>
				<li className="text-l">
					🤝
					<span className="ml-2">
						This template showcases a simple agent chatbot using{" "}
						<a href="https://https://www.solanaagentkit.xyz/">SolanaAgentKit</a>
						{", "}
						<a href="https://js.langchain.com/" target="_blank">
							LangChain.js
						</a>{" "}
						and the Vercel{" "}
						<a href="https://sdk.vercel.ai/docs" target="_blank">
							AI SDK
						</a>{" "}
						in a{" "}
						<a href="https://nextjs.org/" target="_blank">
							Next.js
						</a>{" "}
						project.
					</span>
				</li>
				<li className="hidden text-l md:block">
					💻
					<span className="ml-2">
						You can find the prompt and model logic for this use-case in{" "}
						<code>app/api/chat/route.ts</code>.
					</span>
				</li>
				<li className="hidden text-l md:block">
					🎨
					<span className="ml-2">
						The main frontend logic is found in <code>app/page.tsx</code>.
					</span>
				</li>
				<li className="text-l">
					🐙
					<span className="ml-2">
						This template is open source - you can see the source code and
						deploy your own version{" "}
						<a
							href="https://github.com/michaelessiet/solana-agent-nextjs-starter-langchain"
							target="_blank"
						>
							from the GitHub repo
						</a>
						!
					</span>
				</li>
				<li className="text-l">
					👇
					<span className="ml-2">
						Try asking e.g. <code>What is my wallet address?</code> below!
					</span>
				</li>
			</ul>
		</div>
	);
	return (
		<ChatWindow
			endpoint="api/chat"
			emoji="🤖"
			titleText="Solana agent"
			placeholder="I'm your friendly Solana agent! Ask me anything..."
			emptyStateComponent={InfoCard}
		></ChatWindow>
	);
}
