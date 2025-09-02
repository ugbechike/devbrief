import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '~/services/supabase';
import { getInstallationToken } from '~/lib/github-jwt';
import { SlackService } from '~/services/slack';

interface PRPayload {
    pull_request: {
        number: number;
        title: string;
        body: string | null;
        merged_at: string;
        user: {
            id: number;
            login: string;
            email: string | null;
        };
        additions: number;
        deletions: number;
        changed_files: number;
    };
    repository: {
        full_name: string;
        name: string;
        owner: {
            login: string;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        console.log('=== PR PROCESSING STARTED ===');

        const { payload, installationId, workspaceSlug } = await request.json();

        if (!payload || !installationId || !workspaceSlug) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const pr = payload.pull_request;
        const repo = payload.repository;

        console.log('Processing PR:', {
            repo: repo.full_name,
            prNumber: pr.number,
            title: pr.title,
            author: pr.user.login,
            authorEmail: pr.user.email
        });

        // Get installation token
        const token = await getInstallationToken(installationId);
        if (!token) {
            throw new Error('Failed to get installation token');
        }

        // Fetch PR diff
        console.log('Fetching PR diff...');
        const diffResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/pulls/${pr.number}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.diff',
            },
        });

        if (!diffResponse.ok) {
            throw new Error(`Failed to fetch PR diff: ${diffResponse.status}`);
        }

        const diff = await diffResponse.text();
        console.log('PR diff fetched, length:', diff.length);

        // Generate AI summary
        console.log('Generating AI summary...');
        const summary = await generatePRSummary(pr, diff);
        console.log('AI summary generated:', summary.substring(0, 100) + '...');

        // Store PR summary in database
        const { error: insertError } = await supabaseAdmin
            .from('pr_summary')
            .insert({
                repo: repo.full_name,
                title: pr.title,
                merged_at: pr.merged_at,
                summary: summary,
                github_id: pr.user.id.toString(),
                email: pr.user.email,
            });

        if (insertError) {
            console.error('Error storing PR summary:', insertError);
            // Continue processing even if storage fails
        } else {
            console.log('PR summary stored in database');
        }

        // Find Slack user by GitHub email
        const { data: slackUser, error: userError } = await supabaseAdmin
            .from('slack_users')
            .select('slack_user_id, github_email')
            .eq('workspace_slug', workspaceSlug)
            .or(`email.eq.${pr.user.email},github_email.eq.${pr.user.email}`)
            .single();

        if (userError || !slackUser) {
            console.log('No Slack user found for GitHub email:', pr.user.email);
            return NextResponse.json({
                message: 'PR processed but no Slack user found',
                summary: summary
            });
        }

        console.log('Found Slack user:', slackUser.slack_user_id);

        // Send PR summary to Slack
        try {
            await SlackService.sendPRSummary(
                workspaceSlug,
                slackUser.slack_user_id,
                `🚀 **PR #${pr.number} merged in ${repo.name}**\n\n${summary}`
            );
            console.log('PR summary sent to Slack');
        } catch (slackError) {
            console.error('Failed to send Slack message:', slackError);
            // Don't fail the entire process if Slack fails
        }

        return NextResponse.json({
            message: 'PR processed successfully',
            summary: summary,
            slackUser: slackUser.slack_user_id
        });

    } catch (error) {
        console.error('PR processing error:', error);
        return NextResponse.json({
            error: 'PR processing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

async function generatePRSummary(pr: PRPayload['pull_request'], diff: string): Promise<string> {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
    }

    // Truncate diff if too long (OpenAI has token limits)
    const maxDiffLength = 8000; // Leave room for prompt and response
    const truncatedDiff = diff.length > maxDiffLength
        ? diff.substring(0, maxDiffLength) + '\n... (truncated)'
        : diff;

    const prompt = `You are an expert AI developer assistant. Given the following GitHub pull request, create a concise, Slack-friendly summary of the key changes.

### Pull Request Details:
- **Title**: ${pr.title}
- **Author**: ${pr.user.login}
- **Files Changed**: ${pr.changed_files}
- **Additions**: +${pr.additions}
- **Deletions**: -${pr.deletions}

### Pull Request Description:
${pr.body || 'No description provided'}

### Code Changes:
\`\`\`diff
${truncatedDiff}
\`\`\`

### Instructions:
Create a concise summary (2-3 sentences max) that highlights:
1. What was changed/added/fixed
2. The main impact or benefit
3. Keep it developer-friendly but accessible

Format the response as plain text, no markdown formatting.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 200,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || 'Summary generation failed';
    } catch (error) {
        console.error('OpenAI API error:', error);
        // Fallback summary if AI fails
        return `PR #${pr.number} "${pr.title}" was merged by ${pr.user.login}. Changes: +${pr.additions} additions, -${pr.deletions} deletions across ${pr.changed_files} files.`;
    }
}

