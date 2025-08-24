import { NextRequest, NextResponse } from 'next/server';
import { SlackService } from '~/services/slack';

export async function POST(request: NextRequest) {
    try {
        const { workspaceSlug, userId, prSummary } = await request.json();

        if (!workspaceSlug || !userId || !prSummary) {
            return NextResponse.json(
                { error: 'Missing required fields: workspaceSlug, userId, prSummary' },
                { status: 400 }
            );
        }

        // Send PR summary to Slack
        const result = await SlackService.sendPRSummary(workspaceSlug, userId, prSummary);

        return NextResponse.json({
            success: true,
            message: 'PR summary sent successfully',
            result
        });

    } catch (error) {
        console.error('Error sending PR summary:', error);
        return NextResponse.json(
            { error: 'Failed to send PR summary' },
            { status: 500 }
        );
    }
}
