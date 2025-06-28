import type { APIRoute } from 'astro';

const VENDURE_SHOP_API_URL = import.meta.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    console.log('Logout attempt');

    // Vendure GraphQL mutation for logout
    const logoutMutation = `
      mutation Logout {
        logout {
          success
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
        query: logoutMutation
      })
    });

    const result = await response.json();
    
    // Forward any Set-Cookie headers to clear session
    const setCookieHeaders = response.headers.get('set-cookie');
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (setCookieHeaders) {
      responseHeaders['Set-Cookie'] = setCookieHeaders;
    }

    console.log('Logout completed');

    return new Response(
      JSON.stringify({
        message: 'Abmeldung erfolgreich'
      }),
      {
        status: 200,
        headers: responseHeaders
      }
    );

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if logout fails, return success to clear client state
    return new Response(
      JSON.stringify({ 
        message: 'Abmeldung erfolgreich (lokaler Status gelöscht)'
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}; 