import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceSlug = searchParams.get('workspace_slug');

        if (!workspaceSlug) {
            return NextResponse.json({ error: 'Workspace slug is required' }, { status: 400 });
        }

        console.log('GitHub install - Workspace slug:', workspaceSlug);
        console.log('GitHub install - Encoded state:', encodeURIComponent(workspaceSlug));

        const githubAppId = process.env.GITHUB_APP_ID;
        if (!githubAppId) {
            return NextResponse.json({ error: 'GitHub App ID not configured' }, { status: 500 });
        }

        // Construct GitHub App installation URL
        const githubInstallUrl = new URL('https://github.com/apps/tallylog/installations/new');
        // Properly encode the workspace slug to handle + characters
        githubInstallUrl.searchParams.set('state', encodeURIComponent(workspaceSlug));

        return NextResponse.redirect(githubInstallUrl.toString());
    } catch (error) {
        console.error('GitHub install error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
