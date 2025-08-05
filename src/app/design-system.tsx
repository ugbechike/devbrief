import { Box, Text, ThemeToggle } from "~/components/ui";

export default function DesignSystemPage() {
  return (
    <>
      <Box>
        <Box className="space-y-8">
          {/* Header with Theme Toggle */}
          <Box className="flex justify-between items-center">
            <Text variant="heading" as="h1">
              Design System Demo
            </Text>
            <ThemeToggle />
          </Box>

          {/* Typography Examples */}
          <Box className="space-y-4">
            <Text variant="title" as="h2">
              Typography Variants
            </Text>
            <Text variant="subtitle" as="h3">
              This is a subtitle example
            </Text>
            <Text variant="body">
              This is body text with proper line height and spacing. It&apos;s
              designed to be readable and comfortable to read.
            </Text>
            <Text variant="caption">
              This is caption text, typically used for metadata or secondary
              information.
            </Text>
            <Text variant="small">
              This is small text for fine print or less important information.
            </Text>
          </Box>

          {/* Container Examples */}
          <Box className="space-y-4">
            <Text variant="title" as="h2">
              Container Variants
            </Text>

            <Box variant="card" className="space-y-4">
              <Text variant="subtitle">Card Container</Text>
              <Text variant="body">
                This is a card container with padding, border, and shadow. It
                adapts to the current theme.
              </Text>
            </Box>

            <Box variant="section" className="space-y-4">
              <Text variant="subtitle">Section Container</Text>
              <Text variant="body">
                This is a section container with vertical padding.
              </Text>
            </Box>
          </Box>

          {/* Color Examples */}
          <Box className="space-y-4">
            <Text variant="title" as="h2">
              Color Theme
            </Text>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Box className="bg-primary text-primary-foreground p-4 rounded-lg">
                <Text variant="subtitle" className="text-primary-foreground">
                  Primary Color
                </Text>
                <Text variant="body" className="text-primary-foreground">
                  Dark green (#1a5f3a)
                </Text>
              </Box>
              <Box className="bg-muted p-4 rounded-lg">
                <Text variant="subtitle">Muted Background</Text>
                <Text variant="body">Adapts to theme</Text>
              </Box>
              <Box className="border border-border p-4 rounded-lg">
                <Text variant="subtitle">Border Example</Text>
                <Text variant="body">With border styling</Text>
              </Box>
            </Box>
          </Box>

          {/* Theme Information */}
          <Box variant="card" className="space-y-4">
            <Text variant="title" as="h2">
              Theme Features
            </Text>
            <Box className="space-y-2">
              <Text variant="body">
                • Automatic theme detection based on system preferences
              </Text>
              <Text variant="body">• Theme persistence in localStorage</Text>
              <Text variant="body">• Smooth transitions between themes</Text>
              <Text variant="body">
                • All components automatically adapt to theme changes
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
