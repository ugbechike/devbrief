import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceSlug = searchParams.get('workspace_slug');

        if (!workspaceSlug) {
            return NextResponse.json({ error: 'Workspace slug is required' }, { status: 400 });
        }

        const githubAppId = process.env.GITHUB_APP_ID;
        if (!githubAppId) {
            return NextResponse.json({ error: 'GitHub App ID not configured' }, { status: 500 });
        }

        // Construct GitHub App installation URL
        const githubInstallUrl = new URL('https://github.com/apps/tallylog/installations/new');
        githubInstallUrl.searchParams.set('state', workspaceSlug); // Pass workspace slug in state

        return NextResponse.redirect(githubInstallUrl.toString());
    } catch (error) {
        console.error('GitHub install error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
