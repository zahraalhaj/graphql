const BASE_URL = 'https://learn.reboot01.com/api';

export async function signIn(credentials: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const token = await response.text();
    // Remove any whitespace, quotes, or newlines
    const cleanToken = token.replace(/["\s\n]/g, '');
    
    if (!cleanToken || !cleanToken.includes('.')) {
      throw new Error('Invalid token format');
    }

    return cleanToken;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function fetchGraphQL(query: string, token: string) {
  if (!token) {
    throw new Error('Authentication required');
  }

  // Clean the token of any whitespace, quotes, or newlines
  const cleanToken = token.replace(/["\s\n]/g, '');

  try {
    const response = await fetch(`${BASE_URL}/graphql-engine/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({ query }),
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok || data.errors) {
      throw new Error(data.errors?.[0]?.message || 'GraphQL Error');
    }
    
    return data;
  } catch (error) {
    console.error('GraphQL error details:', error);
    throw error;
  }
}

// Add this function to verify token
export async function verifyToken(token: string) {
  try {
    // Clean the token and ensure proper formatting
    const cleanToken = token.trim();
    
    const response = await fetch(`${BASE_URL}/graphql-engine/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({
        query: `{ user { id } }`
      }),
      credentials: 'include',  // Add this to handle cookies if needed
    });

    const data = await response.json();
    return !data.errors && response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
} 