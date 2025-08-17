# Dashboard Module

This module provides a comprehensive dashboard UI for organizations to manage their repository monitoring setup.

## Features

1. **GitHub App Installation** - Button to install GitHub app with visual feedback
2. **Repository Search & Addition** - Search and add repositories to monitor
3. **Monitored Repositories List** - View and manage currently monitored repositories
4. **Slack App Installation** - Button to install Slack app for notifications

## Components

### DashboardHeader
- Displays organization name and connection status for GitHub and Slack
- Shows visual indicators for connected/disconnected services

### GitHubInstallButton
- Handles GitHub app installation state
- Shows different UI based on connection status
- Triggers installation flow when clicked

### RepoSearch
- Search interface for finding repositories
- Mock search results (replace with actual GitHub API)
- Add repositories to monitoring list

### MonitoredRepos
- Lists all currently monitored repositories
- Shows repository status, language, and last activity
- Allows removal of repositories from monitoring

### SlackInstallButton
- Handles Slack app installation state
- Similar to GitHub button but for Slack integration

## Usage

```tsx
import { Dashboard } from "~/modules/dashboard";

export default function DashboardPage() {
  return <Dashboard />;
}
```

## State Management

The dashboard uses local React state for demonstration purposes. In production:

- Replace mock data with API calls
- Implement proper authentication flows
- Add error handling and loading states
- Connect to real GitHub and Slack APIs

## Styling

Uses Tailwind CSS classes and the project's design system components:
- `Box` for layout containers
- `Text` for typography with predefined variants
- `Button` for interactive elements

## Next Steps

1. Implement actual GitHub OAuth flow
2. Add real repository search via GitHub API
3. Implement Slack OAuth and webhook setup
4. Add database persistence for monitored repositories
5. Implement real-time monitoring and notifications

