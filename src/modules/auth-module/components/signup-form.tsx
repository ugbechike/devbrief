"use client";

import React from "react";
import { Box, Text, Button } from "~/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  isLoading?: boolean;
}

export const SignupForm = ({
  onSubmit,
  isLoading = false,
}: SignupFormProps) => {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleSubmit = (data: SignupFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <Box className="space-y-2">
        <label htmlFor="signup-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          {...form.register("email")}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter your email"
        />
        {form.formState.errors.email && (
          <Text variant="small" className="text-destructive">
            {form.formState.errors.email.message}
          </Text>
        )}
      </Box>

      <Box className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          {...form.register("password")}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Create a password"
        />
        {form.formState.errors.password && (
          <Text variant="small" className="text-destructive">
            {form.formState.errors.password.message}
          </Text>
        )}
      </Box>

      <Box className="space-y-2">
        <label
          htmlFor="signup-confirm-password"
          className="text-sm font-medium"
        >
          Confirm Password
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          {...form.register("confirmPassword")}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Confirm your password"
        />
        {form.formState.errors.confirmPassword && (
          <Text variant="small" className="text-destructive">
            {form.formState.errors.confirmPassword.message}
          </Text>
        )}
      </Box>

      <Box className="text-center">
        <Text variant="small" className="text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Button variant="link" className="p-0 h-auto text-sm">
            Terms of Service
          </Button>{" "}
          and{" "}
          <Button variant="link" className="p-0 h-auto text-sm">
            Privacy Policy
          </Button>
        </Text>
      </Box>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Box className="flex items-center space-x-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </Box>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
};
