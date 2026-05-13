import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role'); // get role from query

    if (token && role) {
      localStorage.setItem('user_token', token); // save token

      // Redirect based on role
      switch (role) {
        case 'Citizen':
          navigate('/citizen-dashboard');
          break;
        case 'Staff':
          navigate('/staff-dashboard');
          break;
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/'); // fallback
      }
    } else {
      navigate('/login'); // redirect to login if missing token/role
    }
  }, [location, navigate]);

  return <p>Logging you in...</p>;
};

export default AuthSuccess;
