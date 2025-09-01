import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '~/services/supabase';
import crypto from 'crypto';

// Verify Slack request signature
function verifySlackRequest(request: NextRequest, body: string): boolean {
    const signature = request.headers.get('x-slack-signature');
    const timestamp = request.headers.get('x-slack-request-timestamp');
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    console.log('Verifying request:', {
        hasSignature: !!signature,
        hasTimestamp: !!timestamp,
        hasSigningSecret: !!signingSecret
    });

    if (!signature || !timestamp || !signingSecret) {
        console.log('Missing required headers or signing secret');
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
    // First check if user already exists
    const { data: existingUser } = await supabaseAdmin
        .from('slack_users')
        .select('id')
        .eq('workspace_slug', workspaceSlug)
        .eq('slack_user_id', userInfo.id)
        .single();

    if (existingUser) {
        // Update existing user
        const { error } = await supabaseAdmin
            .from('slack_users')
            .update({
                email: userInfo.profile?.email || '',
                real_name: userInfo.real_name || '',
                display_name: userInfo.profile?.display_name || '',
                last_interaction_at: new Date().toISOString(),
            })
            .eq('id', existingUser.id);

        if (error) {
            console.error('Error updating user mapping:', error);
        } else {
            console.log('Updated existing user mapping');
        }
    } else {
        // Insert new user
        const { error } = await supabaseAdmin
            .from('slack_users')
            .insert({
                workspace_slug: workspaceSlug,
                slack_user_id: userInfo.id,
                email: userInfo.profile?.email || '',
                real_name: userInfo.real_name || '',
                display_name: userInfo.profile?.display_name || '',
                first_interaction_at: new Date().toISOString(),
                last_interaction_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Error inserting user mapping:', error);
        } else {
            console.log('Inserted new user mapping');
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        console.log('=== MAIN EVENTS ENDPOINT RECEIVED ===');
        console.log('Headers:', Object.fromEntries(request.headers.entries()));
        console.log('Body:', body);

        // For URL verification, we don't need to verify signature
        const event = JSON.parse(body);

        // Handle URL verification challenge
        if (event.type === 'url_verification') {
            console.log('Handling URL verification challenge:', event.challenge);
            return NextResponse.json({ challenge: event.challenge });
        }

        // For actual events, verify request is from Slack
        if (!verifySlackRequest(request, body)) {
            console.log('Invalid signature - headers:', {
                signature: request.headers.get('x-slack-signature'),
                timestamp: request.headers.get('x-slack-request-timestamp')
            });
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Handle events
        if (event.type === 'event_callback') {
            const { event: slackEvent } = event;
            console.log('Processing Slack event:', slackEvent.type, slackEvent);

            // Get workspace slug from team_id
            const { data: installation, error: installError } = await supabaseAdmin
                .from('slack_installations')
                .select('workspace_slug, access_token')
                .eq('team_id', event.team_id)
                .single();

            if (installError) {
                console.error('Error fetching installation:', installError);
                return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }

            if (!installation) {
                console.error('No Slack installation found for team:', event.team_id);
                return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
            }

            console.log('Found installation for workspace:', installation.workspace_slug);

            // Handle different event types
            switch (slackEvent.type) {
                case 'app_home_opened':
                    console.log('User opened app home:', slackEvent.user);

                    // Check if user has provided GitHub email
                    const { data: userData } = await supabaseAdmin
                        .from('slack_users')
                        .select('github_email, first_interaction_at')
                        .eq('workspace_slug', installation.workspace_slug)
                        .eq('slack_user_id', slackEvent.user)
                        .single();

                    const hasGitHubEmail = userData?.github_email;
                    const isFirstTime = !userData?.first_interaction_at;

                    // Only send welcome message if it's the first time or if they don't have GitHub email
                    if (isFirstTime || !hasGitHubEmail) {
                        // Create welcome message
                        const welcomeMessage = hasGitHubEmail
                            ? `✅ **Welcome back to Tallylog!**

Your GitHub email is set to: \`${userData.github_email}\`

You'll receive PR summaries for your weekly updates. If you need to update your email, please contact your admin.`
                            : `🚀 **Welcome to Tallylog!**

I'll help you with weekly and daily updates by sending you concise PR summaries via DM.

**To get started, please reply with your GitHub email:**
"My GitHub email is your-email@example.com"

This helps me send you personalized PR summaries for your weekly updates!`;

                        // Send welcome message as DM
                        const response = await fetch('https://slack.com/api/chat.postMessage', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${installation.access_token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                channel: slackEvent.user,
                                text: welcomeMessage,
                                blocks: [
                                    {
                                        type: 'section',
                                        text: {
                                            type: 'mrkdwn',
                                            text: welcomeMessage,
                                        },
                                    },
                                ],
                            }),
                        });

                        const result = await response.json();
                        console.log('Welcome message sent:', result);
                    } else {
                        console.log('User already has GitHub email, skipping welcome message');
                    }

                    // Also store user mapping (existing logic)
                    const userInfo = await getUserInfo(slackEvent.user, installation.access_token);
                    if (userInfo && userInfo.profile?.email) {
                        await storeUserMapping(installation.workspace_slug, userInfo);
                        console.log(`Stored user mapping for ${userInfo.profile.email}`);
                    } else {
                        console.log('No email found for user:', userInfo);
                    }
                    break;

                case 'app_mention':
                    console.log('App mentioned by user:', slackEvent.user);
                    const mentionUserInfo = await getUserInfo(slackEvent.user, installation.access_token);
                    if (mentionUserInfo && mentionUserInfo.profile?.email) {
                        await storeUserMapping(installation.workspace_slug, mentionUserInfo);
                        console.log(`Stored user mapping for ${mentionUserInfo.profile.email}`);
                    }
                    break;

                case 'message':
                    console.log('Received message event:', {
                        user: slackEvent.user,
                        channel_type: slackEvent.channel_type,
                        text: slackEvent.text,
                        channel: slackEvent.channel
                    });

                    // Only process if it's a DM to the bot
                    if (slackEvent.channel_type === 'im') {
                        console.log('Processing DM from user:', slackEvent.user);

                        // Check if this is a GitHub email message
                        const messageText = slackEvent.text?.toLowerCase() || '';

                        // First try to match with GitHub-specific phrases
                        let emailMatch = messageText.match(/(?:github email is|my github email is|github:)\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

                        // If no match, try to match standalone email (but be more careful)
                        if (!emailMatch) {
                            // Only match standalone email if the message is short and looks like just an email
                            const trimmedText = messageText.trim();
                            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                            if (emailRegex.test(trimmedText) && trimmedText.length < 100) {
                                emailMatch = [trimmedText, trimmedText]; // Create match array with email as both full match and capture group
                            }
                        }

                        if (emailMatch) {
                            const githubEmail = emailMatch[1];
                            console.log('Found GitHub email:', githubEmail);

                            // Update user with GitHub email
                            const { error: updateError } = await supabaseAdmin
                                .from('slack_users')
                                .update({ github_email: githubEmail })
                                .eq('workspace_slug', installation.workspace_slug)
                                .eq('slack_user_id', slackEvent.user);

                            if (updateError) {
                                console.error('Error updating GitHub email:', updateError);
                            } else {
                                console.log('Updated GitHub email for user:', slackEvent.user);

                                // Send confirmation message
                                await fetch('https://slack.com/api/chat.postMessage', {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${installation.access_token}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        channel: slackEvent.channel,
                                        text: `✅ **GitHub email saved!**

Your GitHub email \`${githubEmail}\` has been saved. You'll now receive PR summaries for your weekly updates!`,
                                    }),
                                });
                            }
                        } else {
                            // Regular user mapping (existing logic)
                            const dmUserInfo = await getUserInfo(slackEvent.user, installation.access_token);
                            if (dmUserInfo && dmUserInfo.profile?.email) {
                                await storeUserMapping(installation.workspace_slug, dmUserInfo);
                                console.log(`Stored user mapping for ${dmUserInfo.profile.email}`);
                            }
                        }
                    }
                    break;

                case 'team_join':
                    console.log('New user joined team:', slackEvent.user);
                    const newUserInfo = await getUserInfo(slackEvent.user.id, installation.access_token);
                    if (newUserInfo && newUserInfo.profile?.email) {
                        await storeUserMapping(installation.workspace_slug, newUserInfo);
                        console.log(`Stored new user mapping for ${newUserInfo.profile.email}`);
                    }
                    break;

                default:
                    console.log('Unhandled event type:', slackEvent.type);
                    break;
            }
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('Error handling Slack event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
