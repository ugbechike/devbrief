import supabase from './supabase';
import { getInstallationToken } from '~/lib/github-jwt';

export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    clone_url: string;
    default_branch: string;
    owner: {
        login: string;
        id: number;
    };
}

export interface GitHubInstallation {
    id: number;
    workspace_slug: string;
    github_user_id: number | null;
    github_username: string | null;
    github_email: string | null;
    access_token: string | null;
    installation_id: number | null;
    created_at: string;
    updated_at: string;
}

export class GitHubService {
    static async getInstallation(workspaceSlug: string): Promise<GitHubInstallation | null> {
        try {
            const { data, error } = await supabase
                .from('github_installations')
                .select('*')
                .eq('workspace_slug', workspaceSlug);

            if (error) {
                console.error('Error fetching GitHub installation:', error);
                return null;
            }

            // Return the first record if it exists, otherwise null
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('GitHubService.getInstallation error:', error);
            return null;
        }
    }

    static async isInstalled(workspaceSlug: string): Promise<boolean> {
        const installation = await this.getInstallation(workspaceSlug);
        return installation !== null && installation.installation_id !== null;
    }

    static async getInstallationToken(workspaceSlug: string): Promise<string | null> {
        try {
            const installation = await this.getInstallation(workspaceSlug);
            if (!installation || !installation.installation_id) {
                return null;
            }

            return await getInstallationToken(installation.installation_id);
        } catch (error) {
            console.error('GitHubService.getInstallationToken error:', error);
            return null;
        }
    }

    static async getInstallationRepositories(workspaceSlug: string): Promise<GitHubRepository[]> {
        try {
            const token = await this.getInstallationToken(workspaceSlug);
            if (!token) {
                throw new Error('GitHub not installed for this workspace');
            }

            const response = await fetch('https://api.github.com/installation/repositories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            return data.repositories || [];
        } catch (error) {
            console.error('GitHubService.getInstallationRepositories error:', error);
            throw error;
        }
    }

    static async searchRepositories(workspaceSlug: string, query: string): Promise<GitHubRepository[]> {
        try {
            const token = await this.getInstallationToken(workspaceSlug);
            if (!token) {
                throw new Error('GitHub not installed for this workspace');
            }

            const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('GitHubService.searchRepositories error:', error);
            throw error;
        }
    }

    static async getRepository(workspaceSlug: string, repoFullName: string): Promise<GitHubRepository | null> {
        try {
            const token = await this.getInstallationToken(workspaceSlug);
            if (!token) {
                throw new Error('GitHub not installed for this workspace');
            }

            const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const repo: GitHubRepository = await response.json();
            return repo;
        } catch (error) {
            console.error('GitHubService.getRepository error:', error);
            throw error;
        }
    }
}
