import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from "../../lib/api";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { useAuthSession } from "../../hooks/useAuthSession";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthSession();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) return navigate('/');

      // Fetch user info so dashboards have user_id/role
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) return navigate('/');

      const me = await meRes.json();
      login(token, me.user);

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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center relative overflow-hidden font-sans">
      {/* Decorative background ambient grids and glows */}
      <div className="absolute inset-0 grid-mesh-bg opacity-10 pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        
        {/* Glowing Logo Wrap */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="p-4 bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-2xl flex items-center justify-center"
        >
          <Logo />
        </motion.div>

        {/* Text Loader */}
        <div className="space-y-1.5">
          <h2 className="text-white text-lg font-black tracking-tight">Authenticating Session</h2>
          <p className="text-xs text-slate-400 font-bold tracking-wide uppercase font-mono">Syncing civic keys...</p>
        </div>

        {/* Bouncing Dots Loading Animation */}
        <div className="flex gap-1.5 pt-2 justify-center">
          {[0, 1, 2].map((idx) => (
            <motion.span
              key={idx}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: idx * 0.15, ease: "easeInOut" }}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-indigo-400"
            ></motion.span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AuthSuccess;
