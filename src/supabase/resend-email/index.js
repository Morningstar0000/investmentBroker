// import sendgrid from 'npm:@sendgrid/mail@7.7.0'

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//   'Content-Type': 'application/json'
// }

// Deno.serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   if (req.method !== 'POST') {
//     return new Response(
//       JSON.stringify({ success: false, error: 'Method not allowed' }),
//       { headers: corsHeaders, status: 405 }
//     )
//   }

//   try {
//     const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
//     if (!sendgridApiKey) {
//       console.error('SENDGRID_API_KEY is not set')
//       return new Response(
//         JSON.stringify({ success: false, error: 'Server configuration error' }),
//         { headers: corsHeaders, status: 500 }
//       )
//     }

//     sendgrid.setApiKey(sendgridApiKey)
    
//     const { email, type = 'notification', data } = await req.json()
    
//     if (!email) {
//       return new Response(
//         JSON.stringify({ success: false, error: 'Email is required' }),
//         { headers: corsHeaders, status: 400 }
//       )
//     }

//     const templates = {
//       notification: {
//         subject: 'Notification from Aureus Capital',
//         html: '<h1>Notification</h1><p>You have a new notification.</p>'
//       },
//       trade: {
//         subject: 'Trade Executed - Aureus Capital',
//         html: '<h1>Trade Executed</h1><p>Your trade has been executed.</p>'
//       },
//       newsletter: {
//         subject: 'Aureus Capital Newsletter',
//         html: '<h1>Monthly Update</h1><p>Here is your monthly newsletter.</p>'
//       }
//     }

//     const template = templates[type] || templates.notification

//     const msg = {
//       to: email,
//       from: 'Aureus Capital <aureuscapital00@gmail.com>',
//       subject: template.subject,
//       html: template.html,
//     }

//     await sendgrid.send(msg)

//     return new Response(
//       JSON.stringify({ 
//         success: true, 
//         message: 'Email sent successfully'
//       }),
//       { headers: corsHeaders, status: 200 }
//     )
    
//   } catch (error) {
//     console.error('Error in edge function:', error)
    
//     return new Response(
//       JSON.stringify({ 
//         success: false, 
//         error: error.message || 'An unexpected error occurred' 
//       }),
//       { headers: corsHeaders, status: 500 }
//     )
//   }
// })