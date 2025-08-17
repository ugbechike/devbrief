import React from "react";
import { Box, Text, Button } from "~/components/ui";

interface MonitoredRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  lastActivity: string;
  status: "active" | "inactive" | "error";
}

interface MonitoredReposProps {
  repos: MonitoredRepo[];
  onRemoveRepo: (repoId: string) => void;
}

export const MonitoredRepos: React.FC<MonitoredReposProps> = ({
  repos,
  onRemoveRepo,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  if (repos.length === 0) {
    return (
      <Box className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <Box className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </Box>
        <Text variant="title" className="text-white font-semibold mb-2">
          No repositories monitored yet
        </Text>
        <Text variant="body" className="text-gray-300">
          Add repositories from the search above to start monitoring them
        </Text>
      </Box>
    );
  }

  return (
    <Box className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <Text variant="title" className="text-white font-semibold mb-4">
        Monitored Repositories ({repos.length})
      </Text>

      <Box className="space-y-4">
        {repos.map((repo) => (
          <Box
            key={repo.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <Box className="flex items-start justify-between">
              <Box className="flex-1">
                <Box className="flex items-center gap-3 mb-2">
                  <Text
                    variant="subtitle"
                    className="text-gray-900 font-medium"
                  >
                    {repo.name}
                  </Text>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      repo.status
                    )}`}
                  >
                    {getStatusText(repo.status)}
                  </span>
                </Box>
                <Text variant="body" className="text-gray-600 mb-2">
                  {repo.description}
                </Text>
                <Box className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{repo.language}</span>
                  <span>Last activity: {repo.lastActivity}</span>
                </Box>
              </Box>
              <Button
                onClick={() => onRemoveRepo(repo.id)}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Remove
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
