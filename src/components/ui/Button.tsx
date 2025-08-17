import React from "react";
import { cn } from "~/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer",
      outline:
        "border border-border bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer",
      ghost: "hover:bg-accent hover:text-accent-foreground cursor-pointer",
      link: "text-primary underline-offset-4 hover:underline cursor-pointer",
    };

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
