import React from "react";
import { Text, Box } from "~/components/ui";

interface DashboardHeaderProps {
  orgName: string;
  githubInstalled: boolean;
  slackInstalled: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  orgName,
  githubInstalled,
  slackInstalled,
}) => {
  return (
    <Box className="mb-8">
      <Text variant="heading" className="text-3xl font-bold text-white mb-2">
        {orgName} Dashboard
      </Text>
      <Box className="flex gap-4">
        <Box className="flex items-center gap-2">
          <Box
            className={`w-3 h-3 rounded-full ${
              githubInstalled ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <Text variant="body" className="text-gray-300">
            GitHub {githubInstalled ? "Connected" : "Not Connected"}
          </Text>
        </Box>
        <Box className="flex items-center gap-2">
          <Box
            className={`w-3 h-3 rounded-full ${
              slackInstalled ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <Text variant="body" className="text-gray-300">
            Slack {slackInstalled ? "Connected" : "Not Connected"}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
