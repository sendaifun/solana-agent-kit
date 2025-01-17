import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WalletContext from '../contexts/walletContext.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletContext>
      <App />
    </WalletContext>
  </StrictMode>,
)
