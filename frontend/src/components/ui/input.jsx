import React from "react";

export function Input({ value, onChange, placeholder, type = "text", className = "", error = false, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl border px-4 py-2.5 bg-white text-sm text-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
        error 
          ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20' 
          : 'border-slate-200 focus:border-primary-500 hover:border-slate-300'
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
      className={`w-full rounded-xl border px-4 py-2.5 bg-white text-sm text-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none ${
        error 
          ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20' 
          : 'border-slate-200 focus:border-primary-500 hover:border-slate-300'
      } ${className}`}
      {...props}
    />
  );
}
