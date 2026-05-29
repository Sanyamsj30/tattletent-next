import * as React from "react";
import { cva } from "class-variance-authority";

// ✅ Simple replacement for "@/lib/utils"
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Define button variants
const appButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#d55d1f] text-white hover:bg-[#b54a16] focus:ring-[#d55d1f]",
        outline:
          "border border-[#d55d1f] text-[#d55d1f] bg-transparent hover:bg-[#d55d1f]/10 focus:ring-[#d55d1f]",
        ghost:
          "bg-transparent text-[#d55d1f] hover:bg-[#d55d1f]/10 focus:ring-[#d55d1f]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md text-xs",
        lg: "h-11 px-8 rounded-md text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ✅ Final button component
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
