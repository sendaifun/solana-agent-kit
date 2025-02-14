import React, { useState, useEffect } from "react"
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useWalletStore } from '../hooks/useWalletStore'
import axios from "axios"

const DEVNET_USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')

const WalletUi: React.FC = () => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet()

    const [usdcBalance, setUsdcBalance] = useState<number>(0)
    const { balance, setBalance, totalWalletBalance, setTotalWalletBalance, solPrice, setSolPrice } = useWalletStore()

    const updateBalance = async () => {
        if (!publicKey) return;
        try {
            const balanceLamports = await connection.getBalance(publicKey);
            setBalance(balanceLamports / LAMPORTS_PER_SOL)
        } catch (error) {
            console.error('Error fetching SOL balance:', error);
        }
    };

    const updateUsdcBalance = async () => {
        if (!publicKey) return;
        try {
            // This returns all your token accounts, filtering by the devnet USDC mint
            const tokenAccounts = await connection.getTokenAccountsByOwner(
                publicKey,
                { mint: DEVNET_USDC_MINT }
            );

            if (tokenAccounts.value.length === 0) {
                setUsdcBalance(0)
                return
            }
            const accountInfo = tokenAccounts.value[0].account.data;
            const rawData = Buffer.from(accountInfo);
            const amountBuffer = rawData.subarray(64, 72);
            const amountBn = amountBuffer.readBigUInt64LE(0);

            // USDC has 6 decimals on devnet
            const decimalFactor = 10n ** 6n;
            const usdcAmount = Number(amountBn) / Number(decimalFactor);
            setUsdcBalance(usdcAmount);
        } catch (error) {
            console.error('Error fetching USDC balance:', error);
            setUsdcBalance(0);
        }
    };

    const totalBalance = async () => {
        const url = 'https://api.binance.com/api/v3/ticker/price'
        const response = await axios.get(url, {
          params: {
            symbol: 'SOLUSDC'
          },
        })
        console.log(response.data.price)
        try {
            const solPriceInUSD = response.data.price
            console.log('sol price is ',solPriceInUSD)
            console.log('sol balance is ',balance)
            setSolPrice(solPriceInUSD)
            const totalBal = (balance * solPriceInUSD) + (usdcBalance*1)
            setTotalWalletBalance(totalBal)
        } catch (error) {
            console.error('error is ',error)
        }
    }
      
    useEffect(()=>{
        updateBalance()
        updateUsdcBalance()
        // totalBalance()
    }, [])
    useEffect(()=>{
        // setTimeout(()=>totalBalance() , 1500)
    },[balance])

    return (
        <div className="wallet-ui">
            <button
                onClick={() => { 
                    updateBalance()
                    updateUsdcBalance()
                    totalBalance()
                }}
                style={{backgroundColor:'transparent',border:'none'}}
            >
                <img src="/reload.png" style={{width:30}} />
            </button>
            <h4>${totalWalletBalance.toFixed(2)}</h4>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 20px',borderRadius:15,backgroundColor:'rgb(42, 42, 42)',margin:'10px 0'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <img src="/solana-logo.png" style={{width:35,height:35}} />
                    <div>
                        <p style={{fontWeight:'700'}}>Solana</p>
                        <p style={{opacity:'40%'}}>{balance.toFixed(4)} sol</p>
                    </div>
                </div>
                <p style={{fontWeight:'700'}}>${balance * solPrice}</p>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 20px',borderRadius:15,backgroundColor:'rgb(42, 42, 42)',margin:'10px 0'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <img src="/usdc-logo.png" style={{width:35,height:35}} />
                    <div>
                        <p style={{fontWeight:'700'}}>USDC</p>
                        <p style={{opacity:'40%'}}>{usdcBalance.toFixed(4)} USDC</p>
                    </div>
                </div>
                <p style={{fontWeight:'700'}}>${usdcBalance * 1}</p>
            </div>
        </div>
    )
}

export default WalletUi