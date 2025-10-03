import React from "react";

export function Card({ children, className = "", variant = "default" }) {
  const variants = {
    default: "bg-white border border-secondary-200 shadow-soft hover:shadow-medium",
    glass: "glass-effect border border-white/20",
    elevated: "bg-white border border-secondary-100 shadow-medium hover:shadow-strong",
  };

  return (
    <div className={`rounded-xl transition-all duration-300 hover-lift ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b border-secondary-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold text-secondary-900 ${className}`}>
      {children}
    </h3>
  );
}
