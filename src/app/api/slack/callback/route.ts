import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '~/services/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the workspace slug
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(
            `https://devbrief-ten.vercel.app/dashboard/${state}?error=slack_installation_failed`
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            `https://devbrief-ten.vercel.app/dashboard/${state}?error=invalid_oauth_response`
        );
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
                client_secret: process.env.SLACK_CLIENT_SECRET!,
                code,
                redirect_uri: 'https://devbrief-ten.vercel.app/api/slack/callback',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.ok) {
            console.error('Slack OAuth error:', tokenData);
            return NextResponse.redirect(
                `https://devbrief-ten.vercel.app/dashboard/${state}?error=token_exchange_failed`
            );
        }

        // Store the Slack installation data in your database
        const { error: dbError } = await supabaseAdmin
            .from('slack_installations')
            .upsert({
                workspace_slug: state,
                team_id: tokenData.team?.id,
                team_name: tokenData.team?.name,
                access_token: tokenData.access_token,
                bot_user_id: tokenData.bot_user_id,
                scope: tokenData.scope,
                installed_at: new Date().toISOString(),
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.redirect(
                `https://devbrief-ten.vercel.app/dashboard/${state}?error=database_error`
            );
        }

        // Redirect back to dashboard with success
        return NextResponse.redirect(
            `https://devbrief-ten.vercel.app/dashboard/${state}?slack_installed=true`
        );

    } catch (error) {
        console.error('Slack OAuth error:', error);
        return NextResponse.redirect(
            `https://devbrief-ten.vercel.app/dashboard/${state}?error=installation_failed`
        );
    }
}
