import type { APIRoute } from 'astro';

const MEDUSA_BACKEND_URL = import.meta.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.MEDUSA_PUBLISHABLE_KEY || 'pk_e677a087b82c8104521e193f53d7f8c34362e61dea419fb1fd16a27ca1e2f1ed';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({ 
          message: 'E-Mail und Passwort sind erforderlich' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('Login attempt for:', body.email);

    // Use direct HTTP for login
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Astro-Medusa-Client/1.0',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          message: data.message || 'Anmeldung fehlgeschlagen'
        }),
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('Authentication successful');

    return new Response(
      JSON.stringify({
        customer: data.customer || data.user,
        message: 'Anmeldung erfolgreich'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Interner Serverfehler',
        error: error instanceof Error ? error.message : 'Unknown error'
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