import React from "react";

export function Button({ children, onClick, size = "md", variant = "primary", className = "", disabled = false, ...props }) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98 select-none";
  
  const sizes = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
    xl: "text-lg px-8 py-4",
  };
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 text-white glow-on-hover",
    secondary: "bg-white text-slate-700 border border-slate-200/80 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
    accent: "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30",
    outline: "bg-transparent border-2 border-primary-500 text-primary-600 hover:bg-primary-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-gradient-to-r from-danger-500 to-red-600 hover:from-danger-600 hover:to-red-700 text-white shadow-lg shadow-danger-500/20 hover:shadow-xl hover:shadow-danger-500/30",
    success: "bg-gradient-to-r from-success-500 to-emerald-600 hover:from-success-600 hover:to-emerald-700 text-white shadow-lg shadow-success-500/20 hover:shadow-xl hover:shadow-success-500/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
