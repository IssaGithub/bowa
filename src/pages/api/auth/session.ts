import type { APIRoute } from 'astro';

const MEDUSA_BACKEND_URL = import.meta.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.MEDUSA_PUBLISHABLE_KEY || 'pk_e677a087b82c8104521e193f53d7f8c34362e61dea419fb1fd16a27ca1e2f1ed';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Forward cookies from the client request to Medusa
    const cookies = request.headers.get('cookie');
    
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        ...(cookies && { 'Cookie': cookies }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          message: data.message || 'Sitzung nicht gefunden' 
        }),
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        customer: data.customer,
        message: 'Sitzung gefunden'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Session error:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Interner Serverfehler' 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}; 