import supabase from './supabase';

export interface SlackMessage {
    channel: string;
    text: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks?: any[];
}

export class SlackService {
    /**
     * Get Slack installation data for a workspace
     */
    static async getInstallation(workspaceSlug: string) {
        const { data, error } = await supabase
            .from('slack_installations')
            .select('*')
            .eq('workspace_slug', workspaceSlug)
            .single();

        if (error) {
            throw new Error(`Failed to get Slack installation: ${error.message}`);
        }

        return data;
    }

    /**
     * Send a message to a Slack channel or DM
     */
    static async sendMessage(workspaceSlug: string, message: SlackMessage) {
        const installation = await this.getInstallation(workspaceSlug);

        const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${installation.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel: message.channel,
                text: message.text,
                blocks: message.blocks,
            }),
        });

        const result = await response.json();

        if (!result.ok) {
            throw new Error(`Failed to send Slack message: ${result.error}`);
        }

        return result;
    }

    /**
     * Send a PR summary to a user's DM
     */
    static async sendPRSummary(workspaceSlug: string, userId: string, prSummary: string) {
        const message: SlackMessage = {
            channel: userId, // This will be a DM
            text: prSummary,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*🚀 New PR Summary*',
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: prSummary,
                    },
                },
                {
                    type: 'divider',
                },
            ],
        };

        return this.sendMessage(workspaceSlug, message);
    }

    /**
     * Check if Slack is installed for a workspace
     */
    static async isInstalled(workspaceSlug: string): Promise<boolean> {
        try {
            await this.getInstallation(workspaceSlug);
            return true;
        } catch {
            return false;
        }
    }
}
