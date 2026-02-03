import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'



const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

Deno.serve(async (req) => {
  console.log('=== Edge Function Called ===');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Getting environment variables...');
    
    // Create Supabase admin client using service role key
   // CORRECT - matches your secrets
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000'
    
    console.log('Supabase URL exists:', !!supabaseUrl);
    console.log('Service key exists:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Supabase admin client created');

    // Get request body
    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    let email, type;
    try {
      const body = JSON.parse(requestBody);
      email = body.email;
      type = body.type || 'signup'; // Default to 'signup' if not provided
    } catch (e) {
      throw new Error('Invalid JSON in request body')
    }

    console.log('Email:', email);
    console.log('Type:', type);

    if (!email) {
      throw new Error('Email is required in request body')
    }

    // Use admin client to resend email
    console.log('Calling supabaseAdmin.auth.resend...');
    
    // FIX: Include both email and type parameters
    const { data, error } = await supabaseAdmin.auth.resend({
      type: type,  // Add this - required field
      email: email,
      options: {
        emailRedirectTo: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }

    console.log('Email resent successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email resent successfully',
        data: data 
      }),
      {
        headers: corsHeaders,
        status: 200,
      },
    )
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: corsHeaders,
        status: 400,
      },
    )
  }
})