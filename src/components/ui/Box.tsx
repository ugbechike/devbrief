import React from "react";
import { cn } from "~/lib/utils";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?:
    | "container"
    | "container-sm"
    | "container-md"
    | "container-lg"
    | "container-xl"
    | "card"
    | "section";
  children?: React.ReactNode;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, as: Component = "div", variant, children, ...props }, ref) => {
    const variantClasses = {
      container: "container-md",
      "container-sm": "container-sm",
      "container-md": "container-md",
      "container-lg": "container-lg",
      "container-xl": "container-xl",
      card: "bg-background border border-border rounded-lg p-6 shadow-sm",
      section: "py-8",
    };

    return (
      <Component
        ref={ref}
        className={cn(variant && variantClasses[variant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = "Box";

export { Box };
export type { BoxProps };
