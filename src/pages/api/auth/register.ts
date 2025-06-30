import type { APIRoute } from 'astro';

// Enable server-side rendering for this API route
export const prerender = false;

const VENDURE_SHOP_API_URL = import.meta.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Better JSON parsing with error handling
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return new Response(JSON.stringify({ 
          error: 'Request body is empty' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, password, first_name, last_name } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vendure GraphQL mutation for customer registration
    const registerMutation = `
      mutation RegisterCustomerAccount($input: RegisterCustomerInput!) {
        registerCustomerAccount(input: $input) {
          __typename
          ... on Success {
            success
          }
          ... on MissingPasswordError {
            errorCode
            message
          }
          ... on PasswordValidationError {
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
        query: registerMutation,
        variables: {
          input: {
            emailAddress: email,
            password: password,
            firstName: first_name || '',
            lastName: last_name || ''
          }
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

    const registerResult = result.data?.registerCustomerAccount;
    
    if (registerResult?.__typename === 'Success') {
      // Registration successful, now try to login automatically
      const loginMutation = `
        mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
          login(username: $username, password: $password, rememberMe: $rememberMe) {
            __typename
            ... on CurrentUser {
              id
              identifier
              firstName
              lastName
            }
            ... on InvalidCredentialsError {
              errorCode
              message
            }
          }
        }
      `;

      const loginResponse = await fetch(VENDURE_SHOP_API_URL, {
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

      const loginResult = await loginResponse.json();
      const user = loginResult.data?.login;

      // Forward Set-Cookie headers from Vendure
      const setCookieHeaders = loginResponse.headers.get('set-cookie');
      const responseHeaders: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (setCookieHeaders) {
        responseHeaders['Set-Cookie'] = setCookieHeaders;
      }

      if (user?.__typename === 'CurrentUser') {
        return new Response(JSON.stringify({
          success: true,
          customer: {
            id: user.id,
            email: user.identifier,
            first_name: user.firstName || first_name || user.identifier.split('@')[0],
            last_name: user.lastName || last_name || ''
          }
        }), {
          status: 200,
          headers: responseHeaders
        });
      } else {
        // Registration successful but auto-login failed
        return new Response(JSON.stringify({
          success: true,
          message: 'Registration successful. Please login.',
          customer: {
            id: null,
            email: email,
            first_name: first_name || email.split('@')[0],
            last_name: last_name || ''
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Registration failed
      return new Response(JSON.stringify({ 
        error: registerResult?.message || 'Registration failed' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 