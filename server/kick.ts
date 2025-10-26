import crypto from 'crypto';

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

export function getKickAuthUrl(redirectUri: string, state: string) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.KICK_CLIENT_ID || '',
    redirect_uri: redirectUri,
    scope: 'user:read',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
  });

  return {
    url: `https://id.kick.com/oauth/authorize?${params}`,
    codeVerifier,
  };
}

export async function exchangeKickCodeForToken(code: string, codeVerifier: string, redirectUri: string) {
  const response = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KICK_CLIENT_ID || '',
      client_secret: process.env.KICK_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      code: code,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange error:', errorText);
    throw new Error('Failed to exchange Kick code for token');
  }

  const tokenData = await response.json();
  console.log('Token exchange response:', JSON.stringify(tokenData, null, 2));
  
  return tokenData;
}

export async function getKickUserInfo(accessToken: string) {
  const response = await fetch('https://api.kick.com/public/v1/users', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  console.log('Kick user info response status:', response.status);
  console.log('Kick user info response headers:', Object.fromEntries(response.headers.entries()));
  
  const responseText = await response.text();
  console.log('Kick user info raw response (first 500 chars):', responseText.substring(0, 500));
  
  if (!response.ok) {
    console.error('Kick user info error - full response:', responseText);
    throw new Error(`Failed to fetch Kick user info: ${response.status}`);
  }

  try {
    const response = JSON.parse(responseText);
    console.log('Kick user info parsed data:', JSON.stringify(response, null, 2));
    
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    
    throw new Error('No user data in response');
  } catch (e) {
    console.error('Failed to parse Kick user info as JSON. Response was:', responseText);
    throw new Error('Kick API returned non-JSON response');
  }
}
