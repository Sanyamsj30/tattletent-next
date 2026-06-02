export function Card({ children, className = "", variant = "default" }) {
  const baseBg = className.includes("bg-") ? "" : "bg-white";
  const baseBorder = className.includes("border-") ? "" : "border border-slate-200/80";
  const baseShadow = className.includes("shadow-") ? "" : "shadow-sm hover:shadow-md";

  const variants = {
    default: `${baseBg} ${baseBorder} ${baseShadow} transition-all duration-300`,
    glass: "glass-panel shadow-soft hover:shadow-medium transition-all duration-300",
    elevated: "bg-white border border-slate-100/50 shadow-medium hover:shadow-strong transition-all duration-300",
  };

  return (
    <div className={`rounded-3xl overflow-hidden transition-all duration-300 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-6 sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 sm:px-7 sm:py-5 border-b border-slate-100 bg-slate-50/50 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-base sm:text-lg font-bold text-slate-800 tracking-tight ${className}`}>
      {children}
    </h3>
  );
}
