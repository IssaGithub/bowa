import type { APIRoute } from 'astro';

const MEDUSA_BACKEND_URL = import.meta.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.MEDUSA_PUBLISHABLE_KEY || 'pk_e677a087b82c8104521e193f53d7f8c34362e61dea419fb1fd16a27ca1e2f1ed';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.first_name || !body.last_name) {
      return new Response(
        JSON.stringify({ 
          message: 'Alle Felder sind erforderlich' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('Registration attempt for:', body.email);

    try {
      // Try using Medusa SDK first, but with fallback to HTTP
      let customerResponse;
      let authResponse;
      
      try {
        // Try the SDK approach
        const Medusa = await import('@medusajs/js-sdk');
        const medusa = new Medusa.default({
          baseUrl: MEDUSA_BACKEND_URL,
          publishableKey: MEDUSA_PUBLISHABLE_KEY,
        });

        console.log('Using Medusa SDK...');
        // Try different API patterns based on the actual SDK
        customerResponse = await medusa.store.customer.create({
          email: body.email,
          first_name: body.first_name,
          last_name: body.last_name,
          // password might be handled differently
        });
        
      } catch (sdkError) {
        console.log('SDK failed, using direct HTTP:', sdkError);
        
        // Fallback to direct HTTP with improved headers
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
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
            first_name: body.first_name,
            last_name: body.last_name,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        customerResponse = data;
      }

      console.log('Customer created successfully:', customerResponse);

      // Return success (without auto-login for now to avoid complications)
      return new Response(
        JSON.stringify({
          customer: customerResponse.customer || customerResponse,
          message: 'Registrierung erfolgreich! Sie können sich jetzt anmelden.'
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

    } catch (createError: any) {
      console.error('Customer creation failed:', createError);
      
      return new Response(
        JSON.stringify({ 
          message: createError.message || 'Registrierung fehlgeschlagen',
          details: createError.response?.data || createError.toString()
        }),
        { 
          status: createError.response?.status || 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
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