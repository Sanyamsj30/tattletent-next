import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './index.css'
// import LoginForm from './components/LoginForm.jsx'
//import Home from "./Home.jsx"
//import SignupForm from "./components/SignupForm.jsx"
//import App from "./App.jsx"
//import Home from "./Home"
import StaffDashboard from "./components/ui/StaffDashboard"
//import CitizenDashboard from "./components/ui/CitizenDashboard"


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StaffDashboard/>
    {/*<LoginForm/>*/}
    {/*<SignupForm />*/}
    {/*<App/>*/}
    {/*<Home/>*/}
  </StrictMode>
)
