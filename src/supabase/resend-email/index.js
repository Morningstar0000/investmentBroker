import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('Missing RESEND_API_KEY')
    
    const resend = new Resend(resendApiKey)
    
    const { email, type = 'signup' } = await req.json()
    
    if (!email) throw new Error('Email is required')
    
    const subject = type === 'signup' 
      ? 'Welcome to Aureus Capital' 
      : 'Reset Your Password'
    
    const html = type === 'signup'
      ? '<h1>Welcome! Please verify your email.</h1>'
      : '<h1>Click here to reset your password</h1>'
    
    const { data, error } = await resend.emails.send({
      from: 'Aureus Capital <noreply@resend.dev>',
      to: email,
      subject: subject,
      html: html,
      headers: { 'X-Entity-Ref-ID': crypto.randomUUID() },
      click_tracking: false,
      open_tracking: false,
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent' }),
      { headers: corsHeaders, status: 200 }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: corsHeaders, status: 400 }
    )
  }
})