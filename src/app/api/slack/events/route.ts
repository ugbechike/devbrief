import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '~/services/supabase';
import crypto from 'crypto';

// Verify Slack request signature
function verifySlackRequest(request: NextRequest, body: string): boolean {
    const signature = request.headers.get('x-slack-signature');
    const timestamp = request.headers.get('x-slack-request-timestamp');
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (!signature || !timestamp || !signingSecret) {
        return false;
    }

    const baseString = `v0:${timestamp}:${body}`;
    const expectedSignature = 'v0=' + crypto
        .createHmac('sha256', signingSecret)
        .update(baseString)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Get user info from Slack API
async function getUserInfo(userId: string, accessToken: string) {
    const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    const result = await response.json();
    console.log('====xxx====', result);
    return result.ok ? result.user : null;
}

// Store user mapping in database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function storeUserMapping(workspaceSlug: string, userInfo: any) {
    const { error } = await supabaseAdmin
        .from('slack_users')
        .upsert({
            workspace_slug: workspaceSlug,
            slack_user_id: userInfo.id,
            email: userInfo.profile?.email || '',
            real_name: userInfo.real_name || '',
            display_name: userInfo.profile?.display_name || '',
            last_interaction_at: new Date().toISOString(),
        }, {
            onConflict: 'workspace_slug,slack_user_id'
        });

    if (error) {
        console.error('Error storing user mapping:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();

        // Verify request is from Slack
        if (!verifySlackRequest(request, body)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Handle URL verification challenge
        if (event.type === 'url_verification') {
            return NextResponse.json({ challenge: event.challenge });
        }

        // Handle events
        if (event.type === 'event_callback') {
            const { event: slackEvent } = event;

            // Get workspace slug from team_id
            const { data: installation } = await supabaseAdmin
                .from('slack_installations')
                .select('workspace_slug, access_token')
                .eq('team_id', event.team_id)
                .single();

            if (!installation) {
                console.error('No Slack installation found for team:', event.team_id);
                return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
            }

            // Handle different event types
            switch (slackEvent.type) {
                case 'app_home_opened':
                case 'app_mention':
                case 'message':
                    // Only process if it's a DM to the bot or app mention
                    if (slackEvent.type === 'message' && slackEvent.channel_type !== 'im') {
                        break; // Skip non-DM messages
                    }

                    // Get user info and store mapping
                    const userInfo = await getUserInfo(slackEvent.user, installation.access_token);
                    if (userInfo && userInfo.profile?.email) {
                        await storeUserMapping(installation.workspace_slug, userInfo);
                        console.log(`Stored user mapping for ${userInfo.profile.email}`);
                    }
                    break;

                case 'team_join':
                    // New user joined workspace
                    const newUserInfo = await getUserInfo(slackEvent.user.id, installation.access_token);
                    if (newUserInfo && newUserInfo.profile?.email) {
                        await storeUserMapping(installation.workspace_slug, newUserInfo);
                        console.log(`Stored new user mapping for ${newUserInfo.profile.email}`);
                    }
                    break;
            }
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('Error handling Slack event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
