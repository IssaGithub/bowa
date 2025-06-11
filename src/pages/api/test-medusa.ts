import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Try to import the Medusa SDK
    const Medusa = await import('@medusajs/js-sdk');
    
    // Initialize Medusa client
    const medusa = new Medusa.default({
      baseUrl: 'http://localhost:9000',
      publishableKey: 'pk_e677a087b82c8104521e193f53d7f8c34362e61dea419fb1fd16a27ca1e2f1ed',
    });

    // Test if the client is working
    console.log('Medusa client initialized:', !!medusa);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Medusa SDK loaded successfully',
        clientType: typeof medusa,
        availableMethods: Object.keys(medusa)
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Medusa SDK test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Medusa SDK test failed',
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