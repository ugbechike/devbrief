/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '~/services/supabase';

// Verify GitHub webhook signature
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = `sha256=${createHmac('sha256', secret)
        .update(payload)
        .digest('hex')}`;

    return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
    try {
        console.log('=== GITHUB INSTALLATION WEBHOOK RECEIVED ===');

        // Get the raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-hub-signature-256');
        const eventType = request.headers.get('x-github-event');

        console.log('Installation webhook event type:', eventType);

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
        const payload = JSON.parse(rawBody);
        console.log('Installation payload:', {
            action: payload.action,
            installation: payload.installation?.id,
            account: payload.installation?.account?.login
        });

        // Handle different installation events
        switch (eventType) {
            case 'installation':
                if (payload.action === 'created') {
                    await handleInstallationCreated(payload);
                } else if (payload.action === 'deleted') {
                    await handleInstallationDeleted(payload);
                }
                break;

            case 'installation_repositories':
                if (payload.action === 'added') {
                    await handleRepositoriesAdded(payload);
                } else if (payload.action === 'removed') {
                    await handleRepositoriesRemoved(payload);
                }
                break;

            default:
                console.log('Unhandled installation event:', eventType);
        }

        return NextResponse.json({ message: 'Installation webhook processed' });

    } catch (error) {
        console.error('GitHub installation webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function handleInstallationCreated(payload: any) {
    const installation = payload.installation;
    const account = installation.account;

    console.log('GitHub App installed:', {
        installationId: installation.id,
        accountLogin: account.login,
        accountType: account.type
    });

    // Try to find workspace by GitHub username/org name
    // This is a simple approach - you might want to improve this matching logic
    const { data: workspace, error } = await supabaseAdmin
        .from('workspace')
        .select('slug')
        .eq('name', account.login)
        .single();

    if (error || !workspace) {
        console.log('No workspace found for GitHub account:', account.login);
        return;
    }

    // Update or create GitHub installation record
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
    } else {
        console.log('GitHub installation updated for workspace:', workspace.slug);
    }
}

async function handleInstallationDeleted(payload: any) {
    const installation = payload.installation;

    console.log('GitHub App uninstalled:', installation.id);

    // Remove installation record
    const { error } = await supabaseAdmin
        .from('github_installations')
        .delete()
        .eq('installation_id', installation.id);

    if (error) {
        console.error('Error removing GitHub installation:', error);
    } else {
        console.log('GitHub installation removed');
    }
}

async function handleRepositoriesAdded(payload: any) {
    const installation = payload.installation;
    const repositories = payload.repositories_added;

    console.log('Repositories added to installation:', {
        installationId: installation.id,
        repoCount: repositories.length,
        repos: repositories.map((r: any) => r.full_name)
    });

    // You could automatically add these repos to monitoring here
    // For now, we'll just log them
}

async function handleRepositoriesRemoved(payload: any) {
    const installation = payload.installation;
    const repositories = payload.repositories_removed;

    console.log('Repositories removed from installation:', {
        installationId: installation.id,
        repoCount: repositories.length,
        repos: repositories.map((r: any) => r.full_name)
    });

    // You could automatically remove these repos from monitoring here
    // For now, we'll just log them
}

