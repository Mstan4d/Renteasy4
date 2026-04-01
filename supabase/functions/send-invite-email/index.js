// supabase/functions/send-invite-email/index.js
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  try {
    const { email, inviteToken, firmName, role, invitedBy } = await req.json();
    
    const inviteLink = `https://yourdomain.com/accept-invite/${inviteToken}`;
    
    const { data, error } = await resend.emails.send({
      from: 'RentEasy <invites@renteasy.com>',
      to: [email],
      subject: `You've been invited to join ${firmName} on RentEasy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to RentEasy!</h2>
          <p>You have been invited by <strong>${invitedBy}</strong> to join <strong>${firmName}</strong> as a <strong>${role}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;">Click the button below to accept your invitation:</p>
            <a href="${inviteLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This invitation expires in 7 days.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          
          <p style="color: #9ca3af; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});