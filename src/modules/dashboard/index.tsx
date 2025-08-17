"use client";
import React, { useState } from "react";
import { Box, Text } from "~/components/ui";
import {
  DashboardHeader,
  GitHubInstallButton,
  RepoSearch,
  MonitoredRepos,
  SlackInstallButton,
} from "./components";

export const Dashboard = () => {
  // Mock state - in real implementation this would come from API/database
  const [githubInstalled, setGitHubInstalled] = useState(false);
  const [slackInstalled, setSlackInstalled] = useState(false);
  const [monitoredRepos, setMonitoredRepos] = useState([
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
  ]);

  const handleGitHubInstall = () => {
    // In real implementation, this would redirect to GitHub OAuth
    setGitHubInstalled(true);
  };

  const handleSlackInstall = () => {
    // In real implementation, this would redirect to Slack OAuth
    setSlackInstalled(true);
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
          orgName="DCP"
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
