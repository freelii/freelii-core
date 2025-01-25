"use client";

import { ReactNode } from "react";
import { cn } from "@freelii/utils";
import { VariantProps, cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center text-xs p-2 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-xs font-medium p-2 text-neutral-200 bg-black hover:bg-neutral-900 hover:text-white",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        primary:
          "border-black bg-black text-white hover:bg-gray-800 hover:ring-4 hover:ring-gray-200",
        secondary: cn(
          "border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus-visible:border-gray-500 outline-none",
          "data-[state=open]:border-gray-500 data-[state=open]:ring-4 data-[state=open]:ring-gray-200",
        ),
        success:
          "border-blue-500 bg-blue-500 text-white hover:bg-blue-600 hover:ring-4 hover:ring-blue-100",
        danger:
          "border-red-500 bg-red-500 text-white hover:bg-red-600 hover:ring-4 hover:ring-red-100",
        "danger-outline":
          "border-transparent bg-white text-red-500 hover:bg-red-600 hover:text-white",
        ghost: "bg-transparent text-gray-900 hover:bg-gray-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  className?: string;
  appName?: string;
  text?: string;
  icon?: React.ReactNode;
}

export const Button = ({ children, className, text, icon, variant, onClick }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      onClick={onClick}
    >
      {icon}
      {text || children}
    </button>
  );
};
