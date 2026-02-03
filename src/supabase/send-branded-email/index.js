// supabase/functions/send-branded-email/index.js
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2' // ADD THIS IMPORT

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3001' // REMOVE TRAILING SLASH

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { email, type, user_name } = await req.json()
    
    // Validate required fields
    if (!email || !type) {
      throw new Error('Email and type are required')
    }
    
    // Step 1: Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL'),           // Get from environment
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Service role key here
    )
    
    // Step 2: Generate the auth token/link
    console.log('Generating auth link for:', email, 'type:', type)
    
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: type || 'signup',
      email: email,
      options: {
        redirectTo: `${APP_URL}/auth/confirm`
      }
    })
    
    if (tokenError) {
      console.error('Token generation error:', tokenError)
      throw tokenError
    }
    
    // Step 3: Create verification link
    const verificationLink = `${APP_URL}/auth/confirm?token=${tokenData.properties.email_otp}&type=${type}`
    
    console.log('Generated link:', verificationLink)
    
    // Email content based on type
    const emailConfig = {
      signup: {
        subject: 'Welcome to Aureus Capital - Verify Your Account',
        template: 'welcome'
      },
      invite: {
        subject: "You're Invited to Join Aureus Capital",
        template: 'invite'
      },
      recovery: {
        subject: 'Reset Your Aureus Capital Password',
        template: 'reset'
      }
    }
    
    const config = emailConfig[type] || emailConfig.signup
    
    // Generate email HTML
    const emailHtml = generateEmailTemplate(config.template, {
      email, // PASS EMAIL TO TEMPLATE
      user_name: user_name || email.split('@')[0],
      verification_link: verificationLink,
      app_url: APP_URL,
      brand_name: 'Aureus Capital',
      support_email: 'support@aureus-capital.com',
      current_year: new Date().getFullYear()
    })
    
    // Send email with Resend - use resend.dev for testing
    const { data, error } = await resend.emails.send({
      from: 'Aureus Capital <onboarding@resend.dev>', // Temporary for testing
      to: [email],
      subject: config.subject,
      html: emailHtml
    })
    
    if (error) {
      console.error('Resend error:', error)
      throw error
    }
    
    console.log('Email sent successfully:', data?.id)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: data?.id,
        message: 'Email sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Email template generator
function generateEmailTemplate(template, data) {
  const templates = {
    welcome: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${data.brand_name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .email-container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #1a56db 0%, #1e429f 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .email-logo {
              height: 40px;
              width: auto;
              margin-bottom: 20px;
            }
            .email-brand {
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .email-content {
              padding: 40px 30px;
            }
            .email-title {
              color: #1e429f;
              margin-top: 0;
              font-size: 24px;
            }
            .email-button {
              display: inline-block;
              padding: 14px 32px;
              background: #1a56db;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 25px 0;
              text-align: center;
            }
            .email-button:hover {
              background: #1e429f;
            }
            .email-footer {
              background: #f9fafb;
              padding: 25px 30px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .email-link {
              color: #1a56db;
              text-decoration: none;
            }
            .email-link:hover {
              text-decoration: underline;
            }
            .email-code {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              word-break: break-all;
              margin: 20px 0;
              color: #374151;
            }
            .email-divider {
              height: 1px;
              background: #e5e7eb;
              margin: 30px 0;
            }
            @media (max-width: 600px) {
              .email-content {
                padding: 30px 20px;
              }
              .email-header {
                padding: 30px 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <!-- Update with your actual logo URL -->
              <img src="https://aureus-capital.vercel.app/logo.png" alt="${data.brand_name}" class="email-logo">
              <h1 class="email-brand">${data.brand_name}</h1>
            </div>
            
            <div class="email-content">
              <h2 class="email-title">Welcome to ${data.brand_name}!</h2>
              
              <p>Hi ${data.user_name || 'there'},</p>
              
              <p>Thank you for creating an account with ${data.brand_name}! We're excited to have you on board and help you manage your investments.</p>
              
              <p>To complete your registration and start using all features, please verify your email address:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.verification_link}" class="email-button">
                  Verify Email Address
                </a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="email-code">${data.verification_link}</div>
              
              <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
              
              <div class="email-divider"></div>
              
              <p>If you have any questions or need assistance, our support team is here to help.</p>
              
              <p>Best regards,<br>
              <strong>The ${data.brand_name} Team</strong></p>
            </div>
            
            <div class="email-footer">
              <p>&copy; ${data.current_year} ${data.brand_name}. All rights reserved.</p>
              <p>
                <a href="${data.app_url}/privacy" class="email-link">Privacy Policy</a> | 
                <a href="${data.app_url}/terms" class="email-link">Terms of Service</a>
              </p>
              <p>
                <a href="mailto:${data.support_email}" class="email-link">Contact Support</a> | 
                <a href="${data.app_url}" class="email-link">Visit Website</a>
              </p>
              <p style="font-size: 12px; margin-top: 15px; color: #9ca3af;">
                This email was sent to ${data.email}. If you didn't request this, please ignore it.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    reset: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .email-container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .email-logo {
              height: 40px;
              width: auto;
              margin-bottom: 20px;
            }
            .email-brand {
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .email-content {
              padding: 40px 30px;
            }
            .email-title {
              color: #991b1b;
              margin-top: 0;
              font-size: 24px;
            }
            .email-button {
              display: inline-block;
              padding: 14px 32px;
              background: #dc2626;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 25px 0;
              text-align: center;
            }
            .email-button:hover {
              background: #991b1b;
            }
            .email-footer {
              background: #f9fafb;
              padding: 25px 30px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .email-link {
              color: #dc2626;
              text-decoration: none;
            }
            .email-link:hover {
              text-decoration: underline;
            }
            .email-code {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              word-break: break-all;
              margin: 20px 0;
              color: #374151;
            }
            .email-divider {
              height: 1px;
              background: #e5e7eb;
              margin: 30px 0;
            }
            @media (max-width: 600px) {
              .email-content {
                padding: 30px 20px;
              }
              .email-header {
                padding: 30px 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <img src="https://aureus-capital.vercel.app/logo.png" alt="${data.brand_name}" class="email-logo">
              <h1 class="email-brand">${data.brand_name}</h1>
            </div>
            <div class="email-content">
              <h2 class="email-title">Reset Your Password</h2>
              <p>We received a request to reset your password for your ${data.brand_name} account.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.verification_link}" class="email-button">
                  Reset Password
                </a>
              </div>
              <p>Or copy and paste this link:</p>
              <div class="email-code">${data.verification_link}</div>
              <p><strong>Note:</strong> This link expires in 1 hour. If you didn't request a password reset, ignore this email.</p>
              <p>Best regards,<br><strong>${data.brand_name} Team</strong></p>
            </div>
            <div class="email-footer">
              <p>&copy; ${data.current_year} ${data.brand_name}. All rights reserved.</p>
              <p>
                <a href="${data.app_url}/privacy" class="email-link">Privacy Policy</a> | 
                <a href="${data.app_url}/terms" class="email-link">Terms of Service</a>
              </p>
              <p>
                <a href="mailto:${data.support_email}" class="email-link">Contact Support</a> | 
                <a href="${data.app_url}" class="email-link">Visit Website</a>
              </p>
              <p style="font-size: 12px; margin-top: 15px; color: #9ca3af;">
                This email was sent to ${data.email}. If you didn't request this, please ignore it.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    invite: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to Join ${data.brand_name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .email-container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #059669 0%, #047857 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .email-logo {
              height: 40px;
              width: auto;
              margin-bottom: 20px;
            }
            .email-brand {
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .email-content {
              padding: 40px 30px;
            }
            .email-title {
              color: #059669;
              margin-top: 0;
              font-size: 24px;
            }
            .email-button {
              display: inline-block;
              padding: 14px 32px;
              background: #059669;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 25px 0;
              text-align: center;
            }
            .email-button:hover {
              background: #047857;
            }
            .email-footer {
              background: #f9fafb;
              padding: 25px 30px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .email-link {
              color: #059669;
              text-decoration: none;
            }
            .email-link:hover {
              text-decoration: underline;
            }
            .email-code {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              word-break: break-all;
              margin: 20px 0;
              color: #374151;
            }
            @media (max-width: 600px) {
              .email-content {
                padding: 30px 20px;
              }
              .email-header {
                padding: 30px 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <img src="https://aureus-capital.vercel.app/logo.png" alt="${data.brand_name}" class="email-logo">
              <h1 class="email-brand">${data.brand_name}</h1>
            </div>
            <div class="email-content">
              <h2 class="email-title">You're Invited to Join ${data.brand_name}!</h2>
              <p>Hi ${data.user_name || 'there'},</p>
              <p>You've been invited to join ${data.brand_name} - the premier platform for investment management.</p>
              <p>Click the button below to accept your invitation and get started:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.verification_link}" class="email-button">
                  Accept Invitation
                </a>
              </div>
              <p>Or copy and paste this link:</p>
              <div class="email-code">${data.verification_link}</div>
              <p>This invitation link will expire in 7 days.</p>
              <p>Best regards,<br><strong>${data.brand_name} Team</strong></p>
            </div>
            <div class="email-footer">
              <p>&copy; ${data.current_year} ${data.brand_name}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
  
  return templates[template] || templates.welcome
}