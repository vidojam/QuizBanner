import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'QuizBanner <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'http://localhost:5000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Determine which email service to use
const useResend = !!RESEND_API_KEY;
const resend = useResend ? new Resend(RESEND_API_KEY) : null;

// Create nodemailer transporter for local development
const transporter = !useResend ? nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  }
}) : null;

/**
 * Helper function to send email using either Resend or nodemailer
 */
async function sendEmail(options: { to: string; subject: string; html: string; text: string }): Promise<void> {
  if (useResend && resend) {
    // Use Resend for production (Render)
    await resend.emails.send({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } else if (transporter) {
    // Use nodemailer for local development
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } else {
    throw new Error('No email service configured');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Reset Your QuizBanner Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your QuizBanner password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px; font-size: 14px;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} QuizBanner. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hello,
      
      We received a request to reset your QuizBanner password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      
      © ${new Date().getFullYear()} QuizBanner. All rights reserved.
    `,
  };

  try {
    await sendEmail({
      to: email,
      subject: 'Reset Your QuizBanner Password',
      html: mailOptions.html,
      text: mailOptions.text,
    });
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Welcome to QuizBanner! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to QuizBanner! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName || 'there'},</p>
              <p>Thank you for joining QuizBanner! We're excited to help you learn smarter with customizable scrolling banners.</p>
              
              <h3>What you can do with your Free account:</h3>
              <div class="feature">
                ✓ Create up to 10 question-answer pairs
              </div>
              <div class="feature">
                ✓ Customize banner appearance and timing
              </div>
              <div class="feature">
                ✓ Use screensaver or always-on-top modes
              </div>
              <div class="feature">
                ✓ Manual question entry
              </div>
              
              <p style="text-align: center;">
                <a href="${APP_URL}" class="button">Get Started</a>
              </p>
              
              <p>Want more? Upgrade to Premium for $2.99/year to get:</p>
              <ul>
                <li>Up to 50 question-answer pairs</li>
                <li>CSV file import</li>
                <li>Paste text import</li>
                <li>Advanced customization options</li>
              </ul>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} QuizBanner. All rights reserved.</p>
              <p>Need help? Contact us at support@quizbanner.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to QuizBanner!
      
      Hi ${firstName || 'there'},
      
      Thank you for joining QuizBanner! We're excited to help you learn smarter with customizable scrolling banners.
      
      What you can do with your Free account:
      - Create up to 10 question-answer pairs
      - Customize banner appearance and timing
      - Use screensaver or always-on-top modes
      - Manual question entry
      
      Get started: ${APP_URL}
      
      Want more? Upgrade to Premium for $2.99/year to get up to 50 questions, CSV import, and advanced features.
      
      © ${new Date().getFullYear()} QuizBanner. All rights reserved.
    `,
  };

  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to QuizBanner!',
      html: mailOptions.html,
      text: mailOptions.text,
    });
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
}

/**
 * Send magic link email for passwordless login
 */
export async function sendMagicLinkEmail(email: string, magicLinkToken: string, isPremium: boolean = true): Promise<void> {
  const magicUrl = `${APP_URL}/verify-magic-link?token=${magicLinkToken}`;
  
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: isPremium ? 'Access Your QuizBanner Premium Account 🎉' : 'Login to QuizBanner',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isPremium ? '🎉 Welcome to Premium!' : '🔐 Your Login Link'}</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              ${isPremium ? `
              <p>Click the button below to access your premium QuizBanner account on any device:</p>
              ` : `
              <p>Click the button below to securely login to your QuizBanner account:</p>
              `}
              <p style="text-align: center;">
                <a href="${magicUrl}" class="button">Access QuizBanner${isPremium ? ' Premium' : ''}</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px; font-size: 14px;">${magicUrl}</p>
              ${isPremium ? `
              <h3 style="margin-top: 30px;">Your Premium Features:</h3>
              <ul>
                <li>✓ Up to 50 question-answer pairs</li>
                <li>✓ CSV file import</li>
                <li>✓ Paste text import</li>
                <li>✓ Advanced customization</li>
                <li>✓ Access on any device with this email</li>
              </ul>
              ` : ''}
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">This link will expire in 1 hour. If you didn't request this login, please ignore this email.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} QuizBanner. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      ${isPremium ? 'Welcome to QuizBanner Premium!' : 'Login to QuizBanner'}
      
      Hello,
      
      Click the link below to access your QuizBanner${isPremium ? ' Premium' : ''} account:
      
      ${magicUrl}
      
      This link will expire in 1 hour.
      
      ${isPremium ? `
Your Premium Features:
- Up to 50 question-answer pairs
- CSV file import
- Paste text import
- Advanced customization
- Access on any device with this email
      ` : ''}
      
      If you didn't request this login, please ignore this email.
      
      © ${new Date().getFullYear()} QuizBanner. All rights reserved.
    `,
  };

  try {
    await sendEmail({
      to: email,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text,
    });
    console.log('Magic link email sent to:', email);
  } catch (error) {
    console.error('Error sending magic link email:', error);
    throw new Error('Failed to send magic link email');
  }
}

/**
 * Send contact form notification email
 */
export async function sendContactFormEmail(name: string, email: string, message: string): Promise<void> {
  const mailOptions = {
    from: EMAIL_FROM,
    to: EMAIL_USER, // Send to your own email address
    replyTo: email, // Allow replying directly to the user
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px;">
          <p>This message was sent via the QuizBanner contact form.</p>
        </div>
      </div>
    `,
    text: `
New Contact Form Submission

From: ${name}
Email: ${email}
Date: ${new Date().toLocaleString()}

Message:
${message}

---
This message was sent via the QuizBanner contact form.
    `,
  };

  try {
    await sendEmail({
      to: EMAIL_USER,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text,
    });
    console.log('Contact form notification sent to:', EMAIL_USER);
  } catch (error) {
    console.error('Error sending contact form notification:', error);
    throw new Error('Failed to send contact form notification');
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  if (useResend && RESEND_API_KEY) {
    console.log('✅ Email service configured (Resend)');
    return true;
  }
  
  // Skip verification if email credentials are not configured
  if (!EMAIL_USER || !EMAIL_PASSWORD || EMAIL_USER === 'your-email@gmail.com') {
    console.log('⚠️  Email service not configured. Password reset will not work.');
    console.log('   To enable: Set EMAIL_USER and EMAIL_PASSWORD in .env file');
    return false;
  }
  
  if (!transporter) {
    console.log('⚠️  Email service not configured.');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    console.log('   Check your EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD settings');
    return false;
  }
}
