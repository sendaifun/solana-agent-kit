import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import React from "react"

const LandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            <h1>Welcome to SolGPT</h1>
            <p>AI merge with the solana blockchain</p> 
            <p>Connect your wallet to manage assets like never before </p>
            <div className="connect-btn">
                <sub>connect your wallet</sub>
                <WalletMultiButton>
                    <img src="/solana-logo.png" style={{width:20, marginRight:7}} />
                    Connect Wallet
                    </WalletMultiButton>
            </div>
            <span>Powered by Solana & GPT</span>
            <span style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src="/solana-logo.png" style={{width:70}} />
                <img src="/gpt-logo.webp" style={{width:70}} />
            </span>
        </div>
    )
}

export default LandingPage