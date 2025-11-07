// Email service utility
// This module handles sending emails for verification, notifications, etc.
// Using Resend as the email service provider

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using the configured email service
 * For now, this is a placeholder that logs emails to console
 * TODO: Integrate with Resend or another email service
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  try {
    // Check if email service is configured
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.warn('[EMAIL] No RESEND_API_KEY found. Email will be logged to console only.');
      console.log('='.repeat(80));
      console.log(`[EMAIL] To: ${to}`);
      console.log(`[EMAIL] Subject: ${subject}`);
      console.log(`[EMAIL] HTML: ${html}`);
      console.log(`[EMAIL] Text: ${text || 'N/A'}`);
      console.log('='.repeat(80));
      return true;
    }

    // TODO: Implement actual email sending with Resend
    // const resend = new Resend(apiKey);
    // await resend.emails.send({
    //   from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    //   to,
    //   subject,
    //   html,
    //   text,
    // });

    console.log(`[EMAIL] Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    return false;
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email: string, token: string, userName: string): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003'}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Our Platform!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          
          <p>Thank you for signing up! We're excited to have you on board.</p>
          
          <p>To complete your registration and start using all features, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This verification link will expire in 24 hours.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Booking Platform. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hi ${userName},

    Thank you for signing up! We're excited to have you on board.

    To complete your registration and start using all features, please verify your email address by clicking the link below:

    ${verificationUrl}

    This verification link will expire in 24 hours.

    If you didn't create an account, you can safely ignore this email.

    © ${new Date().getFullYear()} Booking Platform. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This password reset link will expire in 1 hour.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Booking Platform. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hi ${userName},

    We received a request to reset your password. Click the link below to create a new password:

    ${resetUrl}

    This password reset link will expire in 1 hour.

    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

    © ${new Date().getFullYear()} Booking Platform. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
    text,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  email: string,
  userName: string,
  bookingDetails: {
    bookingNumber: string;
    bookingType: string;
    checkIn?: string;
    checkOut?: string;
    totalAmount: number;
  }
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          
          <p>Your booking has been confirmed! Here are your booking details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Booking Number:</strong> ${bookingDetails.bookingNumber}</p>
            <p style="margin: 10px 0;"><strong>Booking Type:</strong> ${bookingDetails.bookingType}</p>
            ${bookingDetails.checkIn ? `<p style="margin: 10px 0;"><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>` : ''}
            ${bookingDetails.checkOut ? `<p style="margin: 10px 0;"><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>` : ''}
            <p style="margin: 10px 0;"><strong>Total Amount:</strong> $${bookingDetails.totalAmount.toFixed(2)}</p>
          </div>
          
          <p>We look forward to serving you!</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Booking Platform. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hi ${userName},

    Your booking has been confirmed! Here are your booking details:

    Booking Number: ${bookingDetails.bookingNumber}
    Booking Type: ${bookingDetails.bookingType}
    ${bookingDetails.checkIn ? `Check-in: ${bookingDetails.checkIn}` : ''}
    ${bookingDetails.checkOut ? `Check-out: ${bookingDetails.checkOut}` : ''}
    Total Amount: $${bookingDetails.totalAmount.toFixed(2)}

    We look forward to serving you!

    © ${new Date().getFullYear()} Booking Platform. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: `Booking Confirmation - ${bookingDetails.bookingNumber}`,
    html,
    text,
  });
}

