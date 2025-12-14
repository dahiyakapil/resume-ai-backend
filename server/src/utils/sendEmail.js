import { Resend } from 'resend';

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured in environment variables");
    }

    console.log(`[EMAIL] Attempting to send email to: ${to}`);

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend API
    const { data, error } = await resend.emails.send({
      from: 'Resumind AI <onboarding@resend.dev>', // Resend's default sender for testing
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('[EMAIL] Resend API error:', error);
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
    }

    console.log(`[EMAIL] Message sent successfully to ${to}. ID: ${data.id}`);
    return { messageId: data.id, ...data };

  } catch (error) {
    console.error(`[EMAIL] Failed to send email to ${to}:`, {
      error: error.message,
      name: error.name,
      stack: error.stack
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
