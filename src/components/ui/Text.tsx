import React from "react";
import { cn } from "~/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: "heading" | "title" | "subtitle" | "body" | "caption" | "small";
  children?: React.ReactNode;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    { className, as: Component = "p", variant = "body", children, ...props },
    ref
  ) => {
    const variantClasses = {
      heading: "text-heading font-bold text-2xl",
      title: "text-title font-bold text-xl",
      subtitle: "text-subtitle font-bold text-lg",
      body: "text-body text-base",
      caption: "text-caption text-sm",
      small: "text-small text-xs",
    };

    return (
      <Component
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

export { Text };
export type { TextProps };
