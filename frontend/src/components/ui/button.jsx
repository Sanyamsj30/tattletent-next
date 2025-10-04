import React from "react";

export function Button({ children, onClick, size = "md", variant = "primary", className = "", disabled = false, ...props }) {
  const base =
    "rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift";
  
  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4",
    xl: "text-xl px-10 py-5",
  };
  
  const variants = {
    primary:"px-4 py-2 rounded-md text-sm bg-primary text-white shadow hover:bg-primaryDark transition",
    secondary: "bg-white text-secondary-700 border border-secondary-200 shadow-soft hover:bg-secondary-50 hover:shadow-medium focus:ring-secondary-500",
    accent: "bg-gradient-accent text-white shadow-soft hover:shadow-medium focus:ring-accent-500 border border-accent-600",
    gold: "bg-gradient-gold text-white shadow-soft hover:shadow-medium focus:ring-gold-500 border border-gold-600",
    outline: "bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500",
    danger: "bg-red-600 text-white shadow-soft hover:bg-red-700 hover:shadow-medium focus:ring-red-500 border border-red-700",
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
