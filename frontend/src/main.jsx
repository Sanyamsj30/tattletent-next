import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './indexHome.css'
//import LoginForm from './components/LoginForm.jsx'
import Home from "./Home.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Home />
  </StrictMode>
)
