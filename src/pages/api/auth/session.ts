import type { APIRoute } from 'astro';

const VENDURE_SHOP_API_URL = import.meta.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Forward cookies from the client request to Vendure
    const cookies = request.headers.get('cookie');
    
    // Vendure GraphQL query to get current user
    const meQuery = `
      query Me {
        me {
          id
          identifier
          firstName
          lastName
        }
      }
    `;
    
    const response = await fetch(VENDURE_SHOP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
      body: JSON.stringify({
        query: meQuery
      })
    });

    const result = await response.json();

    if (result.errors) {
      return new Response(
        JSON.stringify({ 
          message: 'Sitzung nicht gefunden' 
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const user = result.data?.me;
    
    if (!user || !user.id) {
      return new Response(
        JSON.stringify({ 
          message: 'Sitzung nicht gefunden' 
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        customer: {
          id: user.id,
          email: user.identifier,
          first_name: user.firstName || user.identifier.split('@')[0],
          last_name: user.lastName || ''
        },
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