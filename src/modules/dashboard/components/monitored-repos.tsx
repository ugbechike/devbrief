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
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "inactive":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "error":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
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
      <Box className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
        <Box className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
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
    <Box className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
      <Text variant="title" className="text-white font-semibold mb-6">
        Monitored Repositories ({repos.length})
      </Text>

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <Box
            key={repo.id}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-900/70 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
          >
            <Box className="flex flex-col h-full">
              <Box className="flex items-start justify-between mb-4">
                <Text
                  variant="subtitle"
                  className="text-white font-semibold text-lg truncate flex-1 mr-3"
                >
                  {repo.name}
                </Text>
                <span
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusColor(
                    repo.status
                  )}`}
                >
                  {getStatusText(repo.status)}
                </span>
              </Box>

              <Text
                variant="body"
                className="text-gray-300 mb-4 flex-1 line-clamp-2"
              >
                {repo.description}
              </Text>

              <Box className="space-y-3">
                <Box className="flex items-center gap-2 text-sm text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{repo.language || "Unknown"}</span>
                </Box>

                <Box className="flex items-center gap-2 text-sm text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Last activity: {repo.lastActivity}</span>
                </Box>
              </Box>

              <Button
                onClick={() => onRemoveRepo(repo.id)}
                variant="outline"
                className="mt-4 w-full text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-colors duration-200"
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
