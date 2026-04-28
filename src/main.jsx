import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { ClubProvider } from './context/ClubContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ClubProvider>
        <App />
      </ClubProvider>
    </AuthProvider>
  </StrictMode>,
)
