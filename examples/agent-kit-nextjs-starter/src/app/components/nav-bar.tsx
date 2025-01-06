"use client"
import Link from "next/link"

export default function Navbar() {
  // const { connected, publicKey, sendTransaction } = useWallet();
    return (
        <div className="p-4 fixed w-full top-2 flex z-50 justify-between items-center px-8 md:px-20 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 bg-indigo-600">
        <Link href="/" className="flex gap-2 items-center justify-center text-white text-lg font-bold">
                  SOLANA AGENT TOOLKIT
        </Link>
        
        {/* <button className="rounded-md border border-white p-4">Connect Wallet</button> */}
        <div className="text-center">
          <button className="p-2 rounded-full border-2 border-white bg-indigo-700">Connect Wallet</button>
        </div>
      </div>
    )
}