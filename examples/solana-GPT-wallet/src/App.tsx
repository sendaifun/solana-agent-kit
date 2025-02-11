import React  from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
import LandingPage from '../components/landingPage'
import HomePage from '../components/homePage'
import './App.css'
import '@solana/wallet-adapter-react-ui/styles.css'

const App : React.FC = ()=>{
    const { publicKey } = useWallet()

    if(!publicKey) return <LandingPage />
    if(publicKey) return <HomePage />
}

export default App
