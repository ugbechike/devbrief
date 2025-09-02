import { SignJWT, importPKCS8 } from 'jose';

export async function generateGitHubJWT(): Promise<string> {
    const privateKeyPem = process.env.GITHUB_APP_PRIVATE_KEY;
    const appId = process.env.GITHUB_APP_ID;

    if (!privateKeyPem || !appId) {
        throw new Error('GitHub App credentials not configured');
    }

    try {
        // Import the private key
        const privateKey = await importPKCS8(privateKeyPem, 'RS256');

        // Create JWT
        const jwt = await new SignJWT({
            iss: appId,
        })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuedAt()
            .setExpirationTime('10m')
            .sign(privateKey);

        return jwt;
    } catch (error) {
        console.error('Error generating GitHub JWT:', error);
        throw new Error('Failed to generate GitHub JWT');
    }
}

export async function getInstallationToken(installationId: number): Promise<string> {
    try {
        const jwt = await generateGitHubJWT();

        const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Accept': 'application/vnd.github+json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get installation token: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error getting installation token:', error);
        throw error;
    }
}

