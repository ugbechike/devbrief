import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '~/services/supabase';

// GitHub webhook payload types
interface GitHubAccount {
    id: number;
    login: string;
    email?: string;
    type: 'User' | 'Organization';
}

interface GitHubInstallation {
    id: number;
    account: GitHubAccount;
}

interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
}

interface GitHubUser {
    login: string;
    email?: string;
}

interface GitHubPullRequest {
    number: number;
    title: string;
    user: GitHubUser;
    merged: boolean;
}

interface GitHubWebhookPayload {
    action: string;
    installation?: GitHubInstallation;
    repository?: GitHubRepository;
    pull_request?: GitHubPullRequest;
    repositories_added?: GitHubRepository[];
    repositories_removed?: GitHubRepository[];
}

// Verify GitHub webhook signature
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = `sha256=${createHmac('sha256', secret)
        .update(payload)
        .digest('hex')}`;

    return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
    try {
        console.log('=== GITHUB WEBHOOK RECEIVED ===');

        // Get the raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-hub-signature-256');
        const eventType = request.headers.get('x-github-event');

        console.log('Webhook event type:', eventType);
        console.log('Signature present:', !!signature);

        // Verify webhook signature
        const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('GITHUB_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        if (!signature || !verifyGitHubSignature(rawBody, signature, webhookSecret)) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Parse the payload
        const payload = JSON.parse(rawBody) as GitHubWebhookPayload;
        console.log('Payload action:', payload.action);
        console.log('Repository:', payload.repository?.full_name);

        // Handle different event types
        if (eventType === 'pull_request') {
            await handlePullRequestEvent(payload);
        } else if (eventType === 'installation') {
            await handleInstallationEvent(payload);
        } else if (eventType === 'installation_repositories') {
            await handleInstallationRepositoriesEvent(payload);
        } else {
            console.log('Unhandled event type:', eventType);
            return NextResponse.json({ message: 'Event ignored' });
        }

        return NextResponse.json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('GitHub webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function handlePullRequestEvent(payload: GitHubWebhookPayload) {
    console.log('Processing pull request event');

    // Only process closed/merged PRs
    if (payload.action !== 'closed' || !payload.pull_request?.merged) {
        console.log('Not a merged PR, ignoring');
        return;
    }

    const pr = payload.pull_request;
    const repo = payload.repository;
    const installationId = payload.installation?.id;

    if (!pr || !repo) {
        console.log('Missing required PR or repository data');
        return;
    }

    console.log('Processing merged PR:', {
        repo: repo.full_name,
        prNumber: pr.number,
        title: pr.title,
        installationId: installationId,
        author: pr.user?.login,
        authorEmail: pr.user?.email
    });

    // Check if this repository is being monitored
    const { data: monitoredRepo, error: repoError } = await supabaseAdmin
        .from('repos')
        .select('workspace_slug')
        .eq('repo_name', repo.full_name)
        .eq('is_monitored', true)
        .single();

    if (repoError || !monitoredRepo) {
        console.log('Repository not monitored:', repo.full_name);
        return;
    }

    console.log('Repository is monitored for workspace:', monitoredRepo.workspace_slug);

    // Forward to PR processing endpoint
    const processUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/github/process-pr`;
    console.log('Forwarding to PR processor:', processUrl);

    const processResponse = await fetch(processUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
            payload,
            installationId,
            workspaceSlug: monitoredRepo.workspace_slug,
        }),
    });

    if (!processResponse.ok) {
        const errorText = await processResponse.text();
        console.error('PR processing failed:', processResponse.status, errorText);
        throw new Error('PR processing failed');
    }

    const result = await processResponse.json();
    console.log('PR processing result:', result);
}

async function handleInstallationEvent(payload: GitHubWebhookPayload) {
    console.log('Processing installation event');

    const installation = payload.installation;

    if (!installation) {
        console.log('No installation data in payload');
        return;
    }

    const account = installation.account;

    console.log('GitHub App installation event:', {
        action: payload.action,
        installationId: installation.id,
        accountLogin: account.login,
        accountType: account.type
    });

    if (payload.action === 'created') {
        await handleInstallationCreated(payload);
    } else if (payload.action === 'deleted') {
        await handleInstallationDeleted(payload);
    }
}

async function handleInstallationRepositoriesEvent(payload: GitHubWebhookPayload) {
    console.log('Processing installation repositories event');

    const installation = payload.installation;

    if (!installation) {
        console.log('No installation data in payload');
        return;
    }

    const repositories = payload.repositories_added || payload.repositories_removed;

    console.log('Installation repositories event:', {
        action: payload.action,
        installationId: installation.id,
        repoCount: repositories?.length || 0,
        repos: repositories?.map((r: GitHubRepository) => r.full_name) || []
    });
}

async function handleInstallationCreated(payload: GitHubWebhookPayload) {
    const installation = payload.installation;

    if (!installation) {
        console.log('No installation data in payload');
        return;
    }

    const account = installation.account;

    console.log('GitHub App installed:', {
        installationId: installation.id,
        accountLogin: account.login,
        accountType: account.type
    });

    // Try to find workspace by GitHub username/org name
    // Match by slug (case-insensitive) or by name (case-insensitive)
    const { data: workspace, error } = await supabaseAdmin
        .from('workspace')
        .select('slug')
        .or(`slug.ilike.${account.login.toLowerCase()},name.ilike.${account.login}`)
        .single();

    if (error || !workspace) {
        console.log('No workspace found for GitHub account:', account.login);
        return;
    }

    // Update or create GitHub installation record using upsert
    const { error: upsertError } = await supabaseAdmin
        .from('github_installations')
        .upsert({
            workspace_slug: workspace.slug,
            github_user_id: account.id,
            github_username: account.login,
            github_email: account.email,
            access_token: null, // Not needed for GitHub App
            installation_id: installation.id,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'workspace_slug'
        });

    if (upsertError) {
        console.error('Error updating GitHub installation:', upsertError);
        throw new Error('Failed to update GitHub installation');
    } else {
        console.log('GitHub installation updated for workspace:', workspace.slug);
    }
}

async function handleInstallationDeleted(payload: GitHubWebhookPayload) {
    const installation = payload.installation;

    if (!installation) {
        console.log('No installation data in payload');
        return;
    }

    console.log('GitHub App uninstalled:', installation.id);

    // Remove installation record
    const { error } = await supabaseAdmin
        .from('github_installations')
        .delete()
        .eq('installation_id', installation.id);

    if (error) {
        console.error('Error removing GitHub installation:', error);
        throw new Error('Failed to remove GitHub installation');
    } else {
        console.log('GitHub installation removed');
    }
}

