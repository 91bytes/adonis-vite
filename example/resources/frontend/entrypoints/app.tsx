import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '../ts/app'

const rootNode = document.getElementById('app')!
const root = createRoot(rootNode)
root.render(<App />)
