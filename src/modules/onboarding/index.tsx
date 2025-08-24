"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Button } from "~/components/ui";
import supabase from "~/services/supabase";
import { useGetUser } from "~/hooks/useGetUser";

// helper function to generate a slug from a string
const generateSlug = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, "-");
};

export const OnboardingModule = () => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: userData } = useGetUser();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceName.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const slug = generateSlug(workspaceName);
      // Before we redirect to dashboard, we need to create the workspace
      const { data, error } = await supabase
        .from("workspace")
        .insert({ name: workspaceName, slug, created_by: userData?.user?.id })
        .select()
        .single();

      if (error) {
        console.error("Error creating workspace:", error);
        return;
      }

      if (!data) {
        console.error("No data returned from workspace creation");
        return;
      }

      // Redirect to dashboard with workspace name
      router.push(`/dashboard/${data.slug}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen px-4">
      <Box className="max-w-md w-full space-y-8">
        {/* Header */}
        <Box className="text-center space-y-2">
          <Text variant="title" className="text-2xl font-bold">
            Welcome to DevBrief!
          </Text>
          <Text variant="body" className="text-muted-foreground">
            Let&apos;s set up your workspace to get started
          </Text>
        </Box>

        {/* Setup Form */}
        <Box className="bg-card border border-border rounded-lg p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Box className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your workspace name"
                disabled={isLoading}
                required
              />
            </Box>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !workspaceName.trim()}
            >
              {isLoading ? (
                <Box className="flex items-center space-x-2">
                  <span>Creating workspace...</span>
                </Box>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </form>
        </Box>

        {/* User Info */}
        <Box className="text-center">
          <Text variant="small" className="text-muted-foreground">
            {/* Signed in as {user.email} */}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
