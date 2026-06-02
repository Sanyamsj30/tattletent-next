import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200/60",
    primary: "bg-primary-50 text-primary-600 border border-primary-100",
    success: "bg-success-50 text-success-700 border border-success-100",
    warning: "bg-warning-50 text-warning-700 border border-warning-100",
    danger: "bg-danger-50 text-danger-700 border border-danger-100",
    outline: "bg-transparent text-slate-500 border border-slate-300/80",
    info: "bg-indigo-50 text-indigo-700 border border-indigo-100"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm select-none transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
