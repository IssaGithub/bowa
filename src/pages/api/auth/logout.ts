import type { APIRoute } from 'astro';

const MEDUSA_BACKEND_URL = import.meta.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.MEDUSA_PUBLISHABLE_KEY || 'pk_e677a087b82c8104521e193f53d7f8c34362e61dea419fb1fd16a27ca1e2f1ed';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    console.log('Logout attempt');

    // Use direct HTTP for logout
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Astro-Medusa-Client/1.0',
      },
    });

    // Always return success for logout (even if server logout fails)
    console.log('Logout completed');

    return new Response(
      JSON.stringify({
        message: 'Abmeldung erfolgreich'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
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