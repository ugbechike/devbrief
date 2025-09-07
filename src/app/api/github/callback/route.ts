import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '~/services/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const setup_action = searchParams.get('setup_action');
        const rawState = searchParams.get('state'); // This is our workspace_slug
        // Properly decode the state parameter to handle + characters
        const state = rawState ? decodeURIComponent(rawState.replace(/\+/g, '%2B')) : null;

        console.log('GitHub callback - Raw state:', rawState);
        console.log('GitHub callback - Decoded state:', state);

        if (!state) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?github_error=missing_state`);
        }

        // For GitHub App installation, we don't get installation_id in the callback
        // Instead, we'll store a placeholder and update it when we receive webhook events
        if (setup_action === 'install') {
            // Store GitHub App installation in database
            // Store GitHub App installation using upsert
            const { error: insertError } = await supabaseAdmin
                .from('github_installations')
                .upsert({
                    workspace_slug: state,
                    github_user_id: null, // Will be updated from webhook
                    github_username: null, // Will be updated from webhook
                    github_email: null, // Will be updated from webhook
                    access_token: null, // Not needed for GitHub App
                    installation_id: null, // Will be updated from webhook
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'workspace_slug'
                });

            if (insertError) {
                console.error('Error storing GitHub installation:', insertError);
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${state}?github_error=database_error`);
            }

            console.log('GitHub App installation initiated for workspace:', state);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${state}?github_installed=true`);
        }

        // Handle other setup actions
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${state}?github_action=${setup_action}`);

    } catch (error) {
        console.error('GitHub callback error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?github_error=internal_error`);
    }
}
