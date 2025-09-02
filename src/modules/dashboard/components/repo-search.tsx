"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  owner: {
    login: string;
  };
}

interface RepoSearchProps {
  workspaceSlug: string;
}

export function RepoSearch({ workspaceSlug }: RepoSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"user" | "search">("user");
  const queryClient = useQueryClient();

  // Fetch monitored repositories
  const { data: monitoredRepos = [], isLoading: isLoadingMonitored } = useQuery(
    {
      queryKey: ["monitored-repos", workspaceSlug],
      queryFn: async () => {
        const response = await fetch(
          `/api/github/monitor?workspace_slug=${workspaceSlug}`
        );
        if (!response.ok) throw new Error("Failed to fetch monitored repos");
        const data = await response.json();
        return data.repositories || [];
      },
    }
  );

  // Search repositories
  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["repo-search", workspaceSlug, searchQuery, searchType],
    queryFn: async () => {
      if (!searchQuery && searchType === "search") return [];

      const params = new URLSearchParams({
        workspace_slug: workspaceSlug,
        type: searchType,
      });

      if (searchQuery) {
        params.append("q", searchQuery);
      }

      const response = await fetch(`/api/github/repos?${params}`);
      if (!response.ok) throw new Error("Failed to search repositories");
      const data = await response.json();
      return data.repositories || [];
    },
    enabled:
      searchType === "user" ||
      (searchType === "search" && searchQuery.length > 0),
  });

  // Monitor/unmonitor repository
  const monitorMutation = useMutation({
    mutationFn: async ({
      repoName,
      isMonitored,
    }: {
      repoName: string;
      isMonitored: boolean;
    }) => {
      const response = await fetch("/api/github/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug,
          repoName,
          isMonitored,
        }),
      });

      if (!response.ok) throw new Error("Failed to update monitoring status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["monitored-repos", workspaceSlug],
      });
    },
  });

  const isMonitored = (repoFullName: string) => {
    return monitoredRepos.some((repo: any) => repo.repo_name === repoFullName);
  };

  const handleToggleMonitoring = (repo: Repository) => {
    const currentlyMonitored = isMonitored(repo.full_name);
    monitorMutation.mutate({
      repoName: repo.full_name,
      isMonitored: !currentlyMonitored,
    });
  };

  return (
    <div className="space-y-6">
      {/* Monitored Repositories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Monitored Repositories
        </h3>
        {isLoadingMonitored ? (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading monitored repositories...</span>
          </div>
        ) : monitoredRepos.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">
              No repositories are being monitored yet.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Search and add repositories below to start monitoring PR
              summaries.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {monitoredRepos.map((repo: any) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {repo.repo_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Monitoring PR summaries
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    handleToggleMonitoring({
                      full_name: repo.repo_name,
                    } as Repository)
                  }
                  disabled={monitorMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-sm"
                >
                  {monitorMutation.isPending
                    ? "Updating..."
                    : "Stop Monitoring"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Repositories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Add Repositories to Monitor
        </h3>

        {/* Search Type Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSearchType("user")}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              searchType === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Your Repositories
          </button>
          <button
            onClick={() => setSearchType("search")}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              searchType === "search"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Search GitHub
          </button>
        </div>

        {/* Search Input */}
        {searchType === "search" && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search repositories (e.g., owner/repo-name)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Search Results */}
        {isLoadingSearch ? (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading repositories...</span>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">
              {searchType === "user"
                ? "No repositories found in your GitHub account."
                : "No repositories found. Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {searchResults.map((repo: Repository) => {
              const monitored = isMonitored(repo.full_name);
              return (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        monitored ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {repo.full_name}
                      </p>
                      {repo.description && (
                        <p className="text-sm text-gray-600">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            repo.private
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {repo.private ? "Private" : "Public"}
                        </span>
                        <span className="text-xs text-gray-500">
                          by {repo.owner.login}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleToggleMonitoring(repo)}
                    disabled={monitorMutation.isPending}
                    className={`text-sm ${
                      monitored
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {monitorMutation.isPending
                      ? "Updating..."
                      : monitored
                      ? "Stop Monitoring"
                      : "Start Monitoring"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
