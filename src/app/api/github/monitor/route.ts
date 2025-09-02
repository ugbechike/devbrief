import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '~/services/supabase';

export async function POST(request: NextRequest) {
    try {
        const { workspaceSlug, repoName, isMonitored } = await request.json();

        if (!workspaceSlug || !repoName || typeof isMonitored !== 'boolean') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get workspace ID
        const { data: workspace, error: workspaceError } = await supabaseAdmin
            .from('workspace')
            .select('id')
            .eq('slug', workspaceSlug)
            .single();

        if (workspaceError || !workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        if (isMonitored) {
            // Add repository to monitoring
            const { error: insertError } = await supabaseAdmin
                .from('repos')
                .upsert({
                    workspace_slug: workspaceSlug,
                    workspace_id: workspace.id,
                    repo_name: repoName,
                    is_monitored: true,
                }, {
                    onConflict: 'workspace_slug,repo_name'
                });

            if (insertError) {
                console.error('Error adding repository to monitoring:', insertError);
                return NextResponse.json({ error: 'Failed to add repository to monitoring' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Repository added to monitoring' });
        } else {
            // Remove repository from monitoring
            const { error: deleteError } = await supabaseAdmin
                .from('repos')
                .delete()
                .eq('workspace_slug', workspaceSlug)
                .eq('repo_name', repoName);

            if (deleteError) {
                console.error('Error removing repository from monitoring:', deleteError);
                return NextResponse.json({ error: 'Failed to remove repository from monitoring' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Repository removed from monitoring' });
        }

    } catch (error) {
        console.error('GitHub monitor API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceSlug = searchParams.get('workspace_slug');

        if (!workspaceSlug) {
            return NextResponse.json({ error: 'Workspace slug is required' }, { status: 400 });
        }

        // Get monitored repositories
        const { data: repos, error } = await supabaseAdmin
            .from('repos')
            .select('*')
            .eq('workspace_slug', workspaceSlug)
            .eq('is_monitored', true);

        if (error) {
            console.error('Error fetching monitored repositories:', error);
            return NextResponse.json({ error: 'Failed to fetch monitored repositories' }, { status: 500 });
        }

        return NextResponse.json({ repositories: repos || [] });

    } catch (error) {
        console.error('GitHub monitor GET API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

