import React from "react";
import { Button, Box, Text } from "~/components/ui";

interface SlackInstallButtonProps {
  isInstalled: boolean;
  onInstall: () => void;
}

export const SlackInstallButton: React.FC<SlackInstallButtonProps> = ({
  isInstalled,
  onInstall,
}) => {
  if (isInstalled) {
    return (
      <Box className="bg-green-50 border border-green-200 rounded-lg p-4">
        <Box className="flex items-center gap-3">
          <Box className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6.194 14.644c0 1.24-.996 2.24-2.225 2.24-1.23 0-2.225-1-2.225-2.24s.995-2.24 2.225-2.24c1.23 0 2.225 1 2.225 2.24zm5.881-2.24c0-1.24.996-2.24 2.225-2.24s2.225 1 2.225 2.24-.996 2.24-2.225 2.24-2.225-1-2.225-2.24zm5.881 0c0 1.24-.996 2.24-2.225 2.24s-2.225-1-2.225-2.24.996-2.24 2.225-2.24 2.225 1 2.225 2.24z" />
            </svg>
          </Box>
          <Box>
            <Text variant="title" className="text-green-900 font-semibold">
              Slack Connected
            </Text>
            <Text variant="body" className="text-green-700">
              Your Slack workspace is successfully connected
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="bg-white border border-gray-200 rounded-lg p-6">
      <Box className="text-center">
        <Box className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6.194 14.644c0 1.24-.996 2.24-2.225 2.24-1.23 0-2.225-1-2.225-2.24s.995-2.24 2.225-2.24c1.23 0 2.225 1 2.225 2.24zm5.881-2.24c0-1.24.996-2.24 2.225-2.24s2.225 1 2.225 2.24-.996 2.24-2.225 2.24-2.225-1-2.225-2.24zm5.881 0c0 1.24-.996 2.24-2.225 2.24s-2.225-1-2.225-2.24.996-2.24 2.225-2.24 2.225 1 2.225 2.24z" />
          </svg>
        </Box>
        <Text variant="title" className="text-gray-900 font-semibold mb-2">
          Connect Slack
        </Text>
        <Text variant="body" className="text-gray-600 mb-4">
          Install our Slack app to receive notifications about your repositories
        </Text>
        <Button
          onClick={onInstall}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Install Slack App
        </Button>
      </Box>
    </Box>
  );
};
