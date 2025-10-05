import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './indexHome.css'
// import LoginForm from './components/LoginForm.jsx'
//import Home from "./Home.jsx"
import SignupForm from "./components/SignupForm.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<LoginForm/>*/}
    <SignupForm />
  </StrictMode>
)
