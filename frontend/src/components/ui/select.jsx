import React from "react";

export function Select({ value, onValueChange, children, className = "", placeholder = "Select an option", error = false }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full rounded-lg border px-4 py-3 bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
          : 'border-secondary-200 focus:border-primary-500 focus:ring-primary-500/20 hover:border-secondary-300'
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
