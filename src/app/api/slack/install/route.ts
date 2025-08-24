import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const workspaceSlug = searchParams.get('workspace');

    if (!workspaceSlug) {
        return NextResponse.json({ error: 'Workspace slug is required' }, { status: 400 });
    }

    const slackClientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = 'https://devbrief-ten.vercel.app/api/slack/callback';

    if (!slackClientId) {
        return NextResponse.json({ error: 'Slack client ID not configured' }, { status: 500 });
    }

    // Construct Slack OAuth URL
    const slackOAuthUrl = new URL('https://slack.com/oauth/v2/authorize');
    slackOAuthUrl.searchParams.set('client_id', slackClientId);
    slackOAuthUrl.searchParams.set('scope', 'chat:write,channels:read,users:read');
    slackOAuthUrl.searchParams.set('redirect_uri', redirectUri);
    slackOAuthUrl.searchParams.set('state', workspaceSlug); // Pass workspace slug in state

    return NextResponse.redirect(slackOAuthUrl.toString());
}
