import React from "react";
import { Box, Text, Button } from "~/components/ui";

export const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <Box
        as="section"
        className="py-20 bg-gradient-to-br from-background to-muted"
      >
        <Box variant="container-xl" className="text-center space-y-8">
          <Box className="space-y-6">
            <Text variant="heading" className="max-w-4xl mx-auto">
              Automate Your Dev Updates with{" "}
              <span className="text-primary">AI-Powered Summaries</span>
            </Text>
            <Text
              variant="subtitle"
              className="max-w-2xl mx-auto text-muted-foreground"
            >
              DevBrief automatically generates concise summaries of your code
              changes and sends them directly to your Slack DM. Never write
              another manual update again.
            </Text>
          </Box>

          <Box className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box as="section" className="py-20">
        <Box variant="container-xl" className="space-y-16">
          <Box className="text-center space-y-4">
            <Text variant="title">Why DevBrief?</Text>
            <Text
              variant="body"
              className="max-w-2xl mx-auto text-muted-foreground"
            >
              Streamline your development workflow with intelligent automation
              that keeps your team informed without the manual overhead.
            </Text>
          </Box>

          <Box className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Box variant="card" className="p-6 space-y-4">
              <Box className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </Box>
              <Text variant="subtitle">Instant Summaries</Text>
              <Text variant="body" className="text-muted-foreground">
                Get AI-generated summaries of your code changes as soon as PRs
                are merged, delivered straight to your Slack DM.
              </Text>
            </Box>

            {/* Feature 2 */}
            <Box variant="card" className="p-6 space-y-4">
              <Box className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </Box>
              <Text variant="subtitle">Slack Integration</Text>
              <Text variant="body" className="text-muted-foreground">
                Seamless Slack integration sends personalized summaries directly
                to each developer&apos;s DM, ready to copy and share.
              </Text>
            </Box>

            {/* Feature 3 */}
            <Box variant="card" className="p-6 space-y-4">
              <Box className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </Box>
              <Text variant="subtitle">Personal Contribution History</Text>
              <Text variant="body" className="text-muted-foreground">
                Build your personal development timeline with detailed summaries
                of your work for self-reflection and career growth.
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* How It Works Section */}
      <Box as="section" className="py-20 bg-muted/50">
        <Box variant="container-xl" className="space-y-16">
          <Box className="text-center space-y-4">
            <Text variant="title">How It Works</Text>
            <Text
              variant="body"
              className="max-w-2xl mx-auto text-muted-foreground"
            >
              Set up DevBrief in minutes and start receiving automated summaries
              of your code changes.
            </Text>
          </Box>

          <Box className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Box className="text-center space-y-4">
              <Box className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Text className="text-primary-foreground font-bold text-xl">
                  1
                </Text>
              </Box>
              <Text variant="subtitle">Install Slack App</Text>
              <Text variant="body" className="text-muted-foreground">
                Add DevBrief to your Slack workspace with one click
              </Text>
            </Box>

            {/* Step 2 */}
            <Box className="text-center space-y-4">
              <Box className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Text className="text-primary-foreground font-bold text-xl">
                  2
                </Text>
              </Box>
              <Text variant="subtitle">Connect GitHub</Text>
              <Text variant="body" className="text-muted-foreground">
                Install the GitHub app and authorize your repositories
              </Text>
            </Box>

            {/* Step 3 */}
            <Box className="text-center space-y-4">
              <Box className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Text className="text-primary-foreground font-bold text-xl">
                  3
                </Text>
              </Box>
              <Text variant="subtitle">Code & Merge</Text>
              <Text variant="body" className="text-muted-foreground">
                Continue your normal development workflow
              </Text>
            </Box>

            {/* Step 4 */}
            <Box className="text-center space-y-4">
              <Box className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Text className="text-primary-foreground font-bold text-xl">
                  4
                </Text>
              </Box>
              <Text variant="subtitle">Get Summaries</Text>
              <Text variant="body" className="text-muted-foreground">
                Receive AI-generated summaries in your Slack DM
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box as="section" className="py-20">
        <Box variant="container-xl" className="text-center space-y-8">
          <Box className="space-y-6">
            <Text variant="title">Ready to Transform Your Dev Updates?</Text>
            <Text
              variant="body"
              className="max-w-2xl mx-auto text-muted-foreground"
            >
              Join teams that have already automated their development summaries
              and never looked back. Start your free trial today.
            </Text>
          </Box>

          <Box className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Schedule Demo
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box as="footer" className="py-12 border-t border-border">
        <Box variant="container-xl" className="text-center space-y-4">
          <Text variant="subtitle" className="text-primary font-bold">
            DevBrief
          </Text>
          <Text variant="small" className="text-muted-foreground">
            © 2024 DevBrief. All rights reserved.
          </Text>
        </Box>
      </Box>
    </>
  );
};
