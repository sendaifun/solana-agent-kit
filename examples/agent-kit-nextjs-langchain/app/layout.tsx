import "./globals.css";
import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<title>SolanaAgentKit + LangChain + Next.js Template</title>
				<link rel="shortcut icon" href="/images/favicon.ico" />
				<meta
					name="description"
					content="Starter template showing how to use SolanaAgentKit with Langchain in Next.js projects."
				/>
				<meta
					property="og:title"
					content="SolanaAgentKit + LangChain + Next.js Template"
				/>
				<meta
					property="og:description"
					content="Starter template showing how to use SolanaAgentKit with LangChain in Next.js projects."
				/>
				<meta property="og:image" content="/images/title-card.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content="SolanaAgentKit + LangChain + Next.js Template"
				/>
				<meta
					name="twitter:description"
					content="Starter template showing how to use SolanaAgentKit with LangChain in Next.js projects."
				/>
				<meta name="twitter:image" content="/images/title-card.png" />
			</head>
			<body className={publicSans.className}>
				<div className="flex flex-col p-4 md:p-12 h-[100vh]">{children}</div>
			</body>
		</html>
	);
}
