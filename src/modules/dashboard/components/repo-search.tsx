"use client";
import React, { useState } from "react";
import { Button, Box, Text } from "~/components/ui";

interface RepoSearchProps {
  onAddRepo: (repo: {
    name: string;
    fullName: string;
    description: string;
  }) => void;
}

export const RepoSearch: React.FC<RepoSearchProps> = ({ onAddRepo }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Mock search results - in real implementation this would come from GitHub API
  const mockSearchResults = [
    {
      name: "devbrief-app",
      fullName: "dcp/devbrief-app",
      description: "A developer brief application for monitoring repositories",
      language: "TypeScript",
      stars: 42,
    },
    {
      name: "api-gateway",
      fullName: "dcp/api-gateway",
      description: "API gateway service for microservices architecture",
      language: "Go",
      stars: 18,
    },
    {
      name: "frontend-dashboard",
      fullName: "dcp/frontend-dashboard",
      description: "React-based dashboard for monitoring services",
      language: "JavaScript",
      stars: 25,
    },
  ];

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate API call delay
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleAddRepo = (repo: {
    name: string;
    fullName: string;
    description: string;
    language: string;
    stars: number;
  }) => {
    onAddRepo({
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
    });
  };

  return (
    <Box className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <Text variant="title" className="text-white font-semibold mb-4">
        Add Repository to Monitor
      </Text>

      <Box className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
        />
        <Button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </Box>

      {searchQuery && (
        <Box className="space-y-3">
          <Text variant="body" className="text-gray-300 mb-3">
            Search results for &quot;{searchQuery}&quot;
          </Text>
          {mockSearchResults.map((repo) => (
            <Box
              key={repo.fullName}
              className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700"
            >
              <Box className="flex items-start justify-between">
                <Box className="flex-1">
                  <Text
                    variant="subtitle"
                    className="text-white font-medium mb-1"
                  >
                    {repo.name}
                  </Text>
                  <Text variant="body" className="text-gray-300 mb-2">
                    {repo.description}
                  </Text>
                  <Box className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{repo.language}</span>
                    <span>⭐ {repo.stars}</span>
                  </Box>
                </Box>
                <Button
                  onClick={() => handleAddRepo(repo)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Add to Monitor
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
