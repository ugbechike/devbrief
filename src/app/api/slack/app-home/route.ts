import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '~/services/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('App Home request:', body);

        // Handle URL verification challenge
        if (body.type === 'url_verification') {
            return NextResponse.json({ challenge: body.challenge });
        }

        // Handle app home opened event
        if (body.type === 'event_callback' && body.event?.type === 'app_home_opened') {
            const { event } = body;
            const userId = event.user;
            const teamId = body.team_id;

            // Get workspace and user info
            const { data: installation } = await supabaseAdmin
                .from('slack_installations')
                .select('workspace_slug, access_token')
                .eq('team_id', teamId)
                .single();

            if (!installation) {
                console.error('No installation found for team:', teamId);
                return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
            }

            // Check if user has provided GitHub email
            const { data: userData } = await supabaseAdmin
                .from('slack_users')
                .select('github_email')
                .eq('workspace_slug', installation.workspace_slug)
                .eq('slack_user_id', userId)
                .single();

            const hasGitHubEmail = userData?.github_email;

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
                    channel: userId,
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

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('App Home error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
