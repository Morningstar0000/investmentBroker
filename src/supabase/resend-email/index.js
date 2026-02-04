import { Resend } from 'npm:resend@2.0.0'
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
    
    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000'
    
    console.log('Resend API key exists:', !!resendApiKey);
    
    if (!resendApiKey) {
      throw new Error('Missing Resend API key')
    }
    
    const resend = new Resend(resendApiKey)

    // Get request body
    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    let email, type;
    try {
      const body = JSON.parse(requestBody);
      email = body.email;
      type = body.type || 'signup';
    } catch (e) {
      throw new Error('Invalid JSON in request body')
    }

    console.log('Email:', email);
    console.log('Type:', type);

    if (!email) {
      throw new Error('Email is required in request body')
    }

    // Create email content based on type
    let subject, htmlContent;
    const logoUrl = `${appUrl}/logo.png`;
    
    switch(type) {
      case 'signup':
        subject = 'Welcome to Aureus Capital - Verify Your Email';
        htmlContent = `
          <div style="text-align: center; padding: 20px 0; background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="Aureus Capital" width="120" height="auto" style="max-width: 120px; height: auto; margin-bottom: 10px;">
            <h1 style="color: #2563eb; margin: 10px 0 5px 0; font-size: 24px; font-weight: bold;">Welcome to Aureus Capital</h1>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Your journey to smart copy trading starts here</p>
          </div>
          
          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">Verify Your Email Address</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello,<br><br>
            Thank you for creating an account with Aureus Capital! 
            Click the button below to verify your email address and complete your registration.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/auth/callback" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 13px; text-align: center;">
            This link will expire in 24 hours.<br>
            If you didn't create an account, please ignore this email.
          </p>
        `;
        break;
        
      case 'password_reset':
        subject = 'Reset Your Aureus Capital Password';
        htmlContent = `
          <div style="text-align: center; padding: 20px 0; background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="Aureus Capital" width="120" height="auto" style="max-width: 120px; height: auto; margin-bottom: 10px;">
            <h1 style="color: #2563eb; margin: 10px 0 5px 0; font-size: 24px; font-weight: bold;">Aureus Capital</h1>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Smart Copy Trading Platform</p>
          </div>
          
          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">Reset Your Password</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello,<br><br>
            You have requested to reset your password for your Aureus Capital account.
            Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/update-password" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 13px; text-align: center;">
            This link will expire in 24 hours.<br>
            If you didn't request this, please ignore this email.
          </p>
        `;
        break;
        
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    // Send email via Resend
    console.log('Sending email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Aureus Capital <noreply@resend.dev>',
      to: email,
      subject: subject,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': crypto.randomUUID(),
      },
      click_tracking: false,  // ✅ Disable click tracking
      open_tracking: false,   // ✅ Disable open tracking
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: data.id
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