import React from 'react'
import ReactDOM from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import App from './App'
import Home from './Home'
import { SocketProvider } from './SocketContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NextUIProvider>
      <SocketProvider>
        <App >
          <Home />
        </App>
      </SocketProvider>
    </NextUIProvider>
  </React.StrictMode>,
)