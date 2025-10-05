import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-simple'
import './index.css'
import { initializeFirebase } from './lib/firebase'

// Initialize Firebase services
initializeFirebase().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)