import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-secondary-100 text-secondary-700 border border-secondary-200",
    primary: "bg-primary-100 text-primary-700 border border-primary-200",
    success: "bg-accent-100 text-accent-700 border border-accent-200",
    warning: "bg-gold-100 text-gold-700 border border-gold-200",
    danger: "bg-red-100 text-red-700 border border-red-200",
    outline: "bg-transparent text-secondary-600 border border-secondary-300",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
