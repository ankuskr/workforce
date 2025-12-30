import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, use ethereal email (fake SMTP)
    // In production, configure real SMTP settings via environment variables
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    // Create a test account for development
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || testAccount.smtp.host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || testAccount.user,
        pass: process.env.SMTP_PASS || testAccount.pass,
      },
    });

    this.logger.log('Email transporter initialized');
  }

  async sendOtpEmail(email: string, otp: string, type: 'signup' | 'reset'): Promise<void> {
    const subject = type === 'signup'
      ? 'Verify Your Email - Workforce'
      : 'Reset Your Password - Workforce';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1890ff;">${type === 'signup' ? 'Welcome to Workforce!' : 'Password Reset Request'}</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f0f2f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1890ff;">${otp}</span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message from Workforce. Please do not reply.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Workforce" <noreply@workforce.com>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);

      // For development, log the preview URL
      if (!process.env.SMTP_HOST) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }
}
