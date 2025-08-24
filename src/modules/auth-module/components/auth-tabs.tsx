"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Text, Button } from "~/components/ui";
import { GoogleAuthButton } from "./google-auth-button";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import type { LoginFormData } from "./login-form";
import type { SignupFormData } from "./signup-form";
import supabase from "~/services/supabase";
import { useMutation } from "@tanstack/react-query";

type TabType = "login" | "signup";

export const AuthTabs = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: workspace } = await supabase
          .from("workspace")
          .select("slug")
          .eq("created_by", user.id)
          .single();

        if (workspace?.slug) {
          router.replace(`/dashboard/${workspace.slug}`);
        }
      }
    };

    checkUser();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginFormData) => {
      const { email, password } = loginData;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
    onSuccess: async ({ data }) => {
      if (data.user) {
        const { data: workspace } = await supabase
          .from("workspace")
          .select("slug")
          .eq("created_by", data.user.id)
          .single();

        if (workspace?.slug) {
          router.replace(`/dashboard/${workspace.slug}`);
        }
      }
    },
    onError: (error) => {
      console.error(error);
      router.push("/auth/login");
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (signupData: SignupFormData) => {
      const { email, password } = signupData;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    },
    onSuccess: async ({ data }) => {
      if (data.user) {
        router.push("/onboarding");
      }
    },
    onError: (error) => {
      console.error(error);
      router.push("/auth/signup");
    },
  });

  // Determine active tab from URL
  const getActiveTab = (): TabType => {
    if (pathname?.includes("/signup") || pathname?.includes("/sign-up")) {
      return "signup";
    }
    return "login";
  };

  const activeTab = getActiveTab();

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
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
          {(loginMutation.error || signupMutation.error) && (
            <Box className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <Text variant="small" className="text-red-600 text-center">
                {loginMutation.error?.message || signupMutation.error?.message}
              </Text>
            </Box>
          )}

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
          <GoogleAuthButton onClick={handleGoogleAuth} disabled={false}>
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
            <LoginForm
              onSubmit={loginMutation.mutateAsync}
              isLoading={loginMutation.isPending}
            />
          )}

          {activeTab === "signup" && (
            <SignupForm
              onSubmit={signupMutation.mutateAsync}
              isLoading={signupMutation.isPending}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
