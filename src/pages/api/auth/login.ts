import type { APIRoute } from 'astro';

const VENDURE_SHOP_API_URL = import.meta.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vendure GraphQL mutation for login
    const loginMutation = `
      mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
        login(username: $username, password: $password, rememberMe: $rememberMe) {
          __typename
          ... on CurrentUser {
            id
            identifier
            channels {
              id
              token
              code
            }
          }
          ... on InvalidCredentialsError {
            errorCode
            message
          }
          ... on NativeAuthStrategyError {
            errorCode
            message
          }
        }
      }
    `;

    const response = await fetch(VENDURE_SHOP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        query: loginMutation,
        variables: {
          username: email,
          password: password,
          rememberMe: true
        }
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      return new Response(JSON.stringify({ 
        error: result.errors[0].message 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const loginResult = result.data?.login;
    
    if (loginResult?.__typename === 'CurrentUser') {
      // Forward Set-Cookie headers from Vendure
      const setCookieHeaders = response.headers.get('set-cookie');
      const responseHeaders: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (setCookieHeaders) {
        responseHeaders['Set-Cookie'] = setCookieHeaders;
      }

      return new Response(JSON.stringify({
        success: true,
        customer: {
          id: loginResult.id,
          email: loginResult.identifier,
          first_name: loginResult.identifier.split('@')[0], // Fallback
          last_name: ''
        }
      }), {
        status: 200,
        headers: responseHeaders
      });
    } else {
      // Login failed
      return new Response(JSON.stringify({ 
        error: loginResult?.message || 'Invalid credentials' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 