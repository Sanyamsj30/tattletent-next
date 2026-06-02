import React from "react";

export function Select({ value, onValueChange, children, className = "", placeholder = "Select an option", error = false }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full rounded-xl border px-4 py-2.5 bg-white text-sm text-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer ${
        error 
          ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20' 
          : 'border-slate-200 focus:border-primary-500 hover:border-slate-300'
      } ${className}`}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
