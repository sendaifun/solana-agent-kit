import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import React from "react"

const Header: React.FC = () => {
    return (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 40px'}}>
            <span style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src="/solana-logo.png" style={{width:50}} />
                <img src="/gpt-logo.webp" style={{width:50}} />
            </span>
            <WalletMultiButton />
        </div>
    )
}

export default Header