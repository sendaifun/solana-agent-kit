import Header from './header'
import WalletUi from './walletUI'
import GptUi from './gptUI'
import React from "react"

const HomePage: React.FC = () => {
    return (
        <div>
            <Header />
            <div style={{display:'flex',padding:'0 40px'}}>
                <GptUi />
                <WalletUi />
            </div>
        </div>
    )
}

export default HomePage