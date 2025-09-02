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
        const payload = JSON.parse(rawBody);
        console.log('Payload action:', payload.action);
        console.log('Repository:', payload.repository?.full_name);

        // Only process pull request events
        if (eventType !== 'pull_request') {
            console.log('Not a pull request event, ignoring');
            return NextResponse.json({ message: 'Event ignored' });
        }

        // Only process closed/merged PRs
        if (payload.action !== 'closed' || !payload.pull_request?.merged) {
            console.log('Not a merged PR, ignoring');
            return NextResponse.json({ message: 'Not a merged PR' });
        }

        const pr = payload.pull_request;
        const repo = payload.repository;
        const installationId = payload.installation?.id;

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
            return NextResponse.json({ message: 'Repository not monitored' });
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
            return NextResponse.json({ error: 'PR processing failed' }, { status: 500 });
        }

        const result = await processResponse.json();
        console.log('PR processing result:', result);

        return NextResponse.json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('GitHub webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

