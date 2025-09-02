"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { GitHubService } from "~/services/github";

interface GitHubInstallButtonProps {
  workspaceSlug: string;
  error?: string;
}

export function GitHubInstallButton({
  workspaceSlug,
  error,
}: GitHubInstallButtonProps) {
  const [isInstalling, setIsInstalling] = useState(false);

  const { data: isInstalled, isLoading } = useQuery({
    queryKey: ["github-installation", workspaceSlug],
    queryFn: () => GitHubService.isInstalled(workspaceSlug),
    staleTime: 10000,
    enabled: !!workspaceSlug,
  });

  const handleGitHubInstall = async () => {
    setIsInstalling(true);
    try {
      window.location.href = `/api/github/install?workspace_slug=${workspaceSlug}`;
    } catch (error) {
      console.error("GitHub install error:", error);
      setIsInstalling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Checking GitHub status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">GitHub Installation Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <Button
          onClick={handleGitHubInstall}
          disabled={isInstalling}
          className="mt-2 bg-red-600 hover:bg-red-700"
        >
          {isInstalling ? "Installing..." : "Try Again"}
        </Button>
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">GitHub Connected</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your GitHub App is installed and ready to monitor repositories.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 text-blue-800 mb-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">Connect GitHub</span>
      </div>
      <p className="text-sm text-blue-700 mb-3">
        Install the GitHub App to monitor repositories and receive PR summaries.
      </p>
      <Button
        onClick={handleGitHubInstall}
        disabled={isInstalling}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isInstalling ? "Installing..." : "Install GitHub App"}
      </Button>
    </div>
  );
}
