import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { headers: corsHeaders, status: 405 }
    )
  }

  try {
    // Get the API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set in environment variables')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // Parse request body
    let email, type
    try {
      const body = await req.json()
      email = body.email
      type = body.type || 'signup'
    } catch (parseError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid email is required' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey)
    
    // Determine email content based on type
    const templates = {
      signup: {
        subject: 'Welcome to Aureus Capital',
        html: '<h1>Welcome! Please verify your email.</h1><p>Thank you for signing up.</p>'
      },
      reset: {
        subject: 'Reset Your Password',
        html: '<h1>Reset Your Password</h1><p>Click the link below to reset your password.</p>'
      }
    }

    const template = templates[type] || templates.signup

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Aureus Capital <noreply@resend.dev>',
      to: [email], // Wrap in array for Resend API
      subject: template.subject,
      html: template.html,
      headers: { 'X-Entity-Ref-ID': crypto.randomUUID() },
      click_tracking: false,
      open_tracking: false,
    })

    if (error) {
      console.error('Resend API error:', error)
      throw error
    }

    console.log('Email sent successfully:', data?.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: data?.id 
      }),
      { headers: corsHeaders, status: 200 }
    )
    
  } catch (error) {
    console.error('Error in edge function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      { headers: corsHeaders, status: 500 }
    )
  }
})