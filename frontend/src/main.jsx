import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './index.css'
// import LoginForm from './components/LoginForm.jsx'
// import SignupForm from "./components/SignupForm.jsx"
//import App from "./App.jsx"
import Home from "./Home"
//import StaffDashboard from "./components/ui/StaffDashboard"
//import CitizenDashboard from "./components/ui/CitizenDashboard"
// import AdminDashboard from "./components/ui/AdminDashboard"
//import AllComplaintPage from "./components/ui/AllComplaintsPage"
//import LearnMorePage from './components/ui/LearnMorePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<LearnMorePage/>*/}
    {/*<AllComplaintPage/>*/}
    {/*<CitizenDashboard/>*/}
    {/* <AdminDashboard/> */}
    {/*<LoginForm/>*/}
    {/* <SignupForm /> */}
    {/*<App/>*/}
    <Home/>
  </StrictMode>
)
