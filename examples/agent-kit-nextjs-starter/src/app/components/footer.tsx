import Link from "next/link";

export default function Footer() {
    return (
        <div className="flex px-16 flex-wrap">
            <div className="flex-1 flex flex-col gap-5 pt-16">
                <h1 className="font-bold text-2xl">Solana Agent Toolkit</h1>
                <p className="text-sm text-indigo-200">The untimate AI agent on solana.</p>
                <p className="text-sm text-indigo-200">All Right Reserved</p>
            </div>
            <div className="w-full md:w-[40%] flex pt-16">
                <div className="flex-1 flex flex-col gap-3">
                    <h3 className="text-bold text-xl">Product</h3>
                    <Link href={"#"} className="text-indigo-200">Features</Link>
                    <Link href={"#"} className="text-indigo-200">Integration</Link>
                    <Link href={"#"} className="text-indigo-200">Pricing</Link>
                    <Link href={"#"} className="text-indigo-200">Changelog</Link>
                </div> 
                <div className="flex-1 flex flex-col gap-3">
                    <h3 className="text-bold text-xl">Company</h3>
                    <Link href={"#"} className="text-indigo-200">Privacy policy</Link>
                    <Link href={"#"} className="text-indigo-200">Support</Link>
                    <Link href={"#"} className="text-indigo-200">Community</Link>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                    <h3 className="text-bold text-xl">Support</h3>
                    <Link href={"#"} className="text-indigo-200">Features</Link>
                    <Link href={"#"} className="text-indigo-200">Integration</Link>
                    <Link href={"#"} className="text-indigo-200">Pricing</Link>
                    <Link href={"#"} className="text-indigo-200">Changelog</Link>
                </div>
                
            </div>
        </div>
    )
}