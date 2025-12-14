import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not configured in environment variables");
    }

    console.log(`[EMAIL] Attempting to send email to: ${to}`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      // Add timeout configuration
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
      socketTimeout: 15000,     // 15 seconds
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('[EMAIL] SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('[EMAIL] SMTP verification failed:', verifyError.message);
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

    // Send email with timeout
    const sendPromise = transporter.sendMail({
      from: `"Resumind AI 👻" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    // Add overall timeout of 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout (30s)')), 30000);
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);

    console.log(`[EMAIL] Message sent successfully to ${to}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL] Failed to send email to ${to}:`, {
      error: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
