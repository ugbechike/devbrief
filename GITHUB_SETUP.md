# GitHub Integration Setup Guide

## Environment Variables

Add these environment variables to your `.env.local` and Vercel:

```bash
# GitHub App Configuration
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYour private key here\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# OpenAI for PR Summaries
OPENAI_API_KEY=your_openai_api_key
```

## Database Setup

Run the following SQL script in your Supabase SQL editor:

```sql
-- Execute the contents of database/github_installations.sql
```

## GitHub App Configuration

Your GitHub App should be configured with:

### Basic Information
- **GitHub App name**: `tallylog`
- **Homepage URL**: `https://devbrief-ten.vercel.app/`
- **Callback URL**: `https://devbrief-ten.vercel.app/api/github/callback`

### Webhook Configuration
- **Webhook URL**: `https://devbrief-ten.vercel.app/api/github-webhook`
- **Webhook Secret**: Use the same value as `GITHUB_WEBHOOK_SECRET`
- **Events**: Subscribe to:
  - `Pull requests` events (for PR merge notifications)
  - `Installation` events (for app installation/uninstallation)
  - `Installation repositories` events (for repo access changes)

**Note**: All webhook events are handled by the single `/api/github-webhook` endpoint, which routes different event types to appropriate handlers.

### Permissions
- **Repository permissions**:
  - Contents: Read
  - Metadata: Read
  - Pull requests: Read
- **Account permissions**:
  - None required

## Testing the Integration

1. **Install GitHub App**: Click "Install GitHub App" in your dashboard
2. **Add Repositories**: Search and add repositories to monitor
3. **Test Webhook**: Create a test PR and merge it to verify webhook delivery
4. **Verify Slack Integration**: Ensure your GitHub email matches your Slack email for DM delivery

## Complete Flow

1. **User installs GitHub App** → Installation webhook updates database
2. **User adds repositories to monitor** → Repos stored in `repos` table
3. **PR is merged** → GitHub webhook triggers PR processing
4. **AI generates summary** → OpenAI creates concise PR summary
5. **Summary sent to Slack** → User receives DM with PR summary

## Next Steps

The GitHub integration is now ready! The system will:
- Allow users to install the GitHub App
- Search and monitor repositories
- Receive webhook events for PR merges
- Generate AI summaries and send them via Slack

## Troubleshooting

- **Installation fails**: Check GitHub App ID and callback URL
- **No repositories found**: Verify GitHub App has access to repositories
- **Webhook not received**: Check webhook URL and secret configuration
- **Installation data not stored**: Ensure webhook URL points to `/api/github-webhook` and includes Installation events
- **Signature verification fails**: Verify `GITHUB_WEBHOOK_SECRET` environment variable matches GitHub App webhook secret
