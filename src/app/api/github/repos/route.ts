import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '~/services/github';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceSlug = searchParams.get('workspace_slug');
        const query = searchParams.get('q');
        const type = searchParams.get('type') || 'user'; // 'user' or 'search'

        if (!workspaceSlug) {
            return NextResponse.json({ error: 'Workspace slug is required' }, { status: 400 });
        }

        // Check if GitHub is installed
        const isInstalled = await GitHubService.isInstalled(workspaceSlug);
        if (!isInstalled) {
            return NextResponse.json({ error: 'GitHub not installed for this workspace' }, { status: 400 });
        }

        let repositories;

        if (type === 'search' && query) {
            // Search public repositories
            repositories = await GitHubService.searchRepositories(workspaceSlug, query);
        } else {
            // Get installation's accessible repositories
            repositories = await GitHubService.getInstallationRepositories(workspaceSlug);
        }

        return NextResponse.json({ repositories });

    } catch (error) {
        console.error('GitHub repos API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
