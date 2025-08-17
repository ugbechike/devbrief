"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Text, Button } from "~/components/ui";
import { GoogleAuthButton } from "./google-auth-button";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import type { LoginFormData } from "./login-form";
import type { SignupFormData } from "./signup-form";

type TabType = "login" | "signup";

export const AuthTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Determine active tab from URL
  const getActiveTab = (): TabType => {
    if (pathname?.includes("/signup") || pathname?.includes("/sign-up")) {
      return "signup";
    }
    return "login";
  };

  const activeTab = getActiveTab();

  const onLoginSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    console.log("Login:", data);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const onSignupSubmit = (data: SignupFormData) => {
    setIsLoading(true);
    console.log("Signup:", data);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    console.log("Google auth clicked");
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleTabClick = (tab: TabType) => {
    if (tab === "login") {
      router.push("/auth/login");
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <Box className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Box className="max-w-md w-full space-y-8">
        {/* Header */}
        <Box className="text-center space-y-2">
          <Text variant="title">
            {activeTab === "login" ? "Welcome back" : "Create your account"}
          </Text>
          <Text variant="body" className="text-muted-foreground">
            {activeTab === "login"
              ? "Sign in to your account to continue"
              : "Get started with DevBrief today"}
          </Text>
        </Box>

        {/* Auth Form Card */}
        <Box variant="card" className="p-8 space-y-6">
          {/* Tabs */}
          <Box className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === "login" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => handleTabClick("login")}
            >
              Sign In
            </Button>
            <Button
              variant={activeTab === "signup" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => handleTabClick("signup")}
            >
              Sign Up
            </Button>
          </Box>

          {/* Google Auth */}
          <GoogleAuthButton onClick={handleGoogleAuth} disabled={isLoading}>
            Continue with Google
          </GoogleAuthButton>

          {/* Divider */}
          <Box className="relative">
            <Box className="absolute inset-0 flex items-center">
              <Box className="w-full border-t border-border" />
            </Box>
            <Box className="relative flex justify-center text-xs uppercase">
              <Text
                variant="small"
                className="bg-background px-2 text-muted-foreground"
              >
                Or continue with
              </Text>
            </Box>
          </Box>

          {/* Forms */}
          {activeTab === "login" && (
            <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
          )}

          {activeTab === "signup" && (
            <SignupForm onSubmit={onSignupSubmit} isLoading={isLoading} />
          )}
        </Box>
      </Box>
    </Box>
  );
};
