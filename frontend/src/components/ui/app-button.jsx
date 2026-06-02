import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const appButtonVariants = cva(
  "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:pointer-events-none select-none transform active:scale-98 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white shadow-md shadow-primary-500/10 hover:shadow-lg glow-on-hover",
        outline:
          "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        ghost:
          "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        sm: "h-9 px-3 rounded-xl text-xs",
        lg: "h-12 px-7 rounded-xl text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const AppButton = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(appButtonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AppButton.displayName = "AppButton";

export default AppButton;
