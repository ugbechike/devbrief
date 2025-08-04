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
      heading: "text-heading",
      title: "text-title",
      subtitle: "text-subtitle",
      body: "text-body",
      caption: "text-caption",
      small: "text-small",
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
