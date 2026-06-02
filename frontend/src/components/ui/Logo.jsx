import React from 'react';

const Logo = ({ showText = true, variant = "light", className = "" }) => {
  const textStyle = variant === "dark" 
    ? "text-slate-100" 
    : "text-slate-900";

  return (
    <a href="/" className={`flex items-center space-x-3 max-w-full cursor-pointer select-none ${className}`}>
      {/* Premium Stylized Emblem Container */}
      <div 
        className="flex items-center justify-center rounded-2xl border border-indigo-400/30 text-white bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 shadow-lg shadow-primary-500/15 w-10 h-10 sm:w-11 sm:h-11 hover:scale-105 active:scale-95 transition-all duration-300 relative group overflow-hidden"
      >
        {/* Ambient Glossy Glow reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        {/* Modern Vector stylized Tent-T Emblem */}
        <svg 
          className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white filter drop-shadow-sm transform group-hover:rotate-6 transition-transform duration-300" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Canopy Chevron roof outline */}
          <path d="M3 14l9-9 9 9" className="stroke-indigo-100 opacity-90" />
          {/* Central Pillar to form the capital 'T' structure */}
          <path d="M12 5v14" />
          {/* Ground platform stabilization line */}
          <path d="M8 19h8" className="opacity-75" strokeWidth="2" />
        </svg>
      </div>

      {/* TattleTent Typography */}
      {showText && (
        <span
          className={`font-black tracking-tight text-lg sm:text-xl leading-none flex items-center ${textStyle}`}
        >
          <span>Tattle</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-indigo-500 to-violet-500 ml-0.5">
            Tent
          </span>
        </span>
      )}
    </a>
  );
};

export default Logo;
