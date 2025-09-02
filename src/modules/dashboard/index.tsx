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
import { GitHubInstallButton as NewGitHubInstallButton } from "./components/github-install-button";
import { RepoSearch as NewRepoSearch } from "./components/repo-search";
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

  // Handle URL parameters for Slack and GitHub installation status
  useEffect(() => {
    const slackInstalledParam = searchParams.get("slack_installed");
    const githubInstalledParam = searchParams.get("github_installed");
    const errorParam = searchParams.get("error");
    const githubErrorParam = searchParams.get("github_error");

    if (slackInstalledParam === "true") {
      setSlackInstalled(true);
      setSlackError(undefined); // Clear any previous errors
      // Clean up URL parameters
      router.replace(`/dashboard/${decodedSlug}`);
    }

    if (githubInstalledParam === "true") {
      setGitHubInstalled(true);
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

    if (githubErrorParam) {
      console.error("GitHub installation error:", githubErrorParam);
      // You can add GitHub error handling here if needed
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
    // Redirect to GitHub App installation
    const installUrl = `/api/github/install?workspace_slug=${encodeURIComponent(
      decodedSlug
    )}`;
    router.push(installUrl);
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
          <NewGitHubInstallButton workspaceSlug={decodedSlug} />
          <SlackInstallButton
            isInstalled={slackInstalled}
            onInstall={handleSlackInstall}
            error={slackError}
            workspaceSlug={decodedSlug}
          />
        </Box>

        <Box className="space-y-8">
          <NewRepoSearch workspaceSlug={decodedSlug} />
        </Box>
      </Box>
    </Box>
  );
};
