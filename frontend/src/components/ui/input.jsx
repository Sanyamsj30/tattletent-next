import React from "react";

export function Input({ value, onChange, placeholder, type = "text", className = "", error = false, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-lg border px-4 py-3 bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
          : 'border-secondary-200 focus:border-primary-500 focus:ring-primary-500/20 hover:border-secondary-300'
      } ${className}`}
      {...props}
    />
  );
}

export function TextArea({ value, onChange, placeholder, className = "", error = false, rows = 4, ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-lg border px-4 py-3 bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
          : 'border-secondary-200 focus:border-primary-500 focus:ring-primary-500/20 hover:border-secondary-300'
      } ${className}`}
      {...props}
    />
  );
}
