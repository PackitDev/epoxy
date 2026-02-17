import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  return resend.emails.send({
    from: options.from || 'noreply@yourdomain.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: `Welcome, ${name}!`,
    html: `
      <h1>Welcome to our platform!</h1>
      <p>Hi ${name}, thanks for signing up.</p>
      <p>Get started by checking out our <a href="#">documentation</a>.</p>
    `,
  });
}
