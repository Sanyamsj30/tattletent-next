import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) return navigate('/');

      sessionStorage.setItem('token', token);

      // Fetch user info so dashboards have user_id/role
      const meRes = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) return navigate('/');

      const me = await meRes.json();
      sessionStorage.setItem('user', JSON.stringify(me.user));

      switch (me.user.role) {
        case 'Citizen':
          navigate('/citizen-dashboard');
          break;
        case 'Staff':
          navigate('/staff-dashboard');
          break;
        case 'Ringmaster':
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        default:
          if (String(me.user.role || '').toLowerCase() === 'admin' || String(me.user.role || '').toLowerCase() === 'ringmaster') {
            navigate('/admin-dashboard');
            break;
          }
          navigate('/');
      }
    };

    run().catch(() => navigate('/'));
  }, [location, navigate]);

  return <p>Logging you in...</p>;
};

export default AuthSuccess;
