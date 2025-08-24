"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Text } from "~/components/ui";
import {
  DashboardHeader,
  GitHubInstallButton,
  RepoSearch,
  MonitoredRepos,
  SlackInstallButton,
} from "./components";
import { useQuery } from "@tanstack/react-query";
import supabase from "~/services/supabase";
import { SlackService } from "~/services/slack";

const mockRepos = [
  {
    id: "1",
    name: "devbrief-app",
    fullName: "dcp/devbrief-app",
    description: "A developer brief application for monitoring repositories",
    language: "TypeScript",
    lastActivity: "2 hours ago",
    status: "active" as const,
  },
  {
    id: "2",
    name: "api-gateway",
    fullName: "dcp/api-gateway",
    description: "API gateway service for microservices architecture",
    language: "Go",
    lastActivity: "1 day ago",
    status: "active" as const,
  },
];

export const Dashboard = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mock state - in real implementation this would come from API/database
  const [githubInstalled, setGitHubInstalled] = useState(false);
  const [slackInstalled, setSlackInstalled] = useState(false);
  const [slackError, setSlackError] = useState<string | undefined>();
  const [monitoredRepos, setMonitoredRepos] = useState(mockRepos);
  const decodedSlug = decodeURIComponent(slug);

  const { data: workspaceData } = useQuery({
    queryKey: ["workspace", decodedSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace")
        .select("*")
        .eq("slug", decodedSlug)
        .single();
      return data;
    },
    enabled: !!decodedSlug,
  });

  // Check if Slack is actually installed
  const { data: slackInstalledData } = useQuery({
    queryKey: ["slack-installation", decodedSlug],
    queryFn: async () => {
      try {
        return await SlackService.isInstalled(decodedSlug);
      } catch {
        return false;
      }
    },
    enabled: !!decodedSlug,
  });

  // Handle URL parameters for Slack installation status
  useEffect(() => {
    const slackInstalledParam = searchParams.get("slack_installed");
    const errorParam = searchParams.get("error");

    if (slackInstalledParam === "true") {
      setSlackInstalled(true);
      setSlackError(undefined); // Clear any previous errors
      // Clean up URL parameters
      router.replace(`/dashboard/${decodedSlug}`);
    }

    if (errorParam) {
      console.error("Slack installation error:", errorParam);
      // Set error message based on error type
      switch (errorParam) {
        case "slack_installation_failed":
          setSlackError(
            "Slack installation was cancelled or failed. Please try again."
          );
          break;
        case "invalid_oauth_response":
          setSlackError("Invalid OAuth response from Slack. Please try again.");
          break;
        case "token_exchange_failed":
          setSlackError(
            "Failed to complete Slack authentication. Please try again."
          );
          break;
        case "database_error":
          setSlackError(
            "Failed to save Slack configuration. Please contact support."
          );
          break;
        default:
          setSlackError(
            "An unexpected error occurred during Slack installation."
          );
      }
      // Clean up URL parameters
      router.replace(`/dashboard/${decodedSlug}`);
    }
  }, [searchParams, router, decodedSlug]);

  // Update Slack installation state when data changes
  useEffect(() => {
    if (slackInstalledData !== undefined) {
      setSlackInstalled(slackInstalledData);
    }
  }, [slackInstalledData]);

  const handleGitHubInstall = () => {
    // In real implementation, this would redirect to GitHub OAuth
    setGitHubInstalled(true);
  };

  const handleSlackInstall = () => {
    // Redirect to Slack OAuth installation
    const installUrl = `/api/slack/install?workspace=${encodeURIComponent(
      decodedSlug
    )}`;
    router.push(installUrl);
  };

  const handleAddRepo = (repo: {
    name: string;
    fullName: string;
    description: string;
  }) => {
    const newRepo = {
      id: Date.now().toString(),
      ...repo,
      language: "Unknown",
      lastActivity: "Just now",
      status: "active" as const,
    };
    setMonitoredRepos([...monitoredRepos, newRepo]);
  };

  const handleRemoveRepo = (repoId: string) => {
    setMonitoredRepos(monitoredRepos.filter((repo) => repo.id !== repoId));
  };

  return (
    <Box className="min-h-screen bg-gray-900">
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          orgName={workspaceData?.name}
          githubInstalled={githubInstalled}
          slackInstalled={slackInstalled}
        />

        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GitHubInstallButton
            isInstalled={githubInstalled}
            onInstall={handleGitHubInstall}
          />
          <SlackInstallButton
            isInstalled={slackInstalled}
            onInstall={handleSlackInstall}
            error={slackError}
            workspaceSlug={decodedSlug}
          />
        </Box>

        {githubInstalled && (
          <Box className="space-y-8">
            <RepoSearch onAddRepo={handleAddRepo} />
            <MonitoredRepos
              repos={monitoredRepos}
              onRemoveRepo={handleRemoveRepo}
            />
          </Box>
        )}

        {!githubInstalled && (
          <Box className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-8 text-center">
            <Box className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Box>
            <Text variant="title" className="text-blue-100 font-semibold mb-2">
              Get Started with Repository Monitoring
            </Text>
            <Text variant="body" className="text-blue-200 mb-4">
              Install the GitHub app above to start monitoring your repositories
              and receive updates
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
