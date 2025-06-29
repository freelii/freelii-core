import { Resend } from 'resend';
import { env } from '../../../env.js';
import { type Connection } from '../base-service';

// Email template interfaces
export interface WelcomeEmailData {
  name: string;
  email: string;
}

export interface PaymentSentNotificationData {
  recipientName: string;
  amount: string;
  currency: string;
  transactionId: string;
  senderName?: string;
}

export interface PaymentReceivedNotificationData {
  recipientName: string;
  amount: string;
  currency: string;
  transactionId: string;
  senderName?: string;
}

export interface InvoiceEmailData {
  recipientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  downloadUrl?: string;
}

export interface PasswordResetData {
  name: string;
  resetLink: string;
  expirationTime: string;
}

export interface BulkDisbursementNotificationData {
  recipientName: string;
  totalRecipients: number;
  totalAmount: string;
  currency: string;
  reference?: string;
}

export interface WaitlistConfirmationData {
  name: string;
  email: string;
  useCase?: string;
  position?: number;
}

export interface SubAccountCreatedData {
  userName: string;
  accountAlias: string;
  createdDate: string;
}

// Email options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  from?: string;
  replyTo?: string;
}

// Email service options with optional session
export interface EmailServiceOptions {
  db: Connection;
  session?: {
    user: {
      id: string;
    };
  } | null;
}

export class EmailService {
  private resend: Resend;
  private defaultFromEmail: string;
  protected db: Connection;
  protected session?: {
    user: {
      id: string;
    };
  } | null;

  constructor(options: EmailServiceOptions) {
    this.db = options.db;
    this.session = options.session;
    this.resend = new Resend(env.RESEND_API_KEY);
    // You can customize this based on your domain
    this.defaultFromEmail = 'Freelii <jose@freelii.app>';
  }

  /**
* Send a generic email
*/
  async sendEmail(options: EmailOptions) {
    try {
      // Ensure at least text is provided if html is not
      const emailData: any = {
        from: options.from || this.defaultFromEmail,
        to: options.to,
        subject: options.subject,
        replyTo: options.replyTo,
      };

      // Add content - prioritize HTML, fallback to text
      if (options.html) {
        emailData.html = options.html;
        if (options.text) {
          emailData.text = options.text;
        }
      } else if (options.text) {
        emailData.text = options.text;
      } else {
        throw new Error('Either html or text content must be provided');
      }

      // Add attachments if provided
      if (options.attachments && options.attachments.length > 0) {
        emailData.attachments = options.attachments;
      }

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        console.error('❌ Failed to send email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('✅ Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: WelcomeEmailData) {
    const html = this.generateWelcomeEmailTemplate(data);

    return this.sendEmail({
      to: data.email,
      subject: 'Welcome to Freelii!',
      html,
      text: `Welcome to Freelii, ${data.name}! We're excited to have you on board.`,
    });
  }

  /**
 * Send payment sent confirmation email
 */
  async sendPaymentSentNotification(data: PaymentSentNotificationData & { to: string }) {
    const html = this.generatePaymentSentNotificationTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject: `Payment Sent Successfully - ${data.amount} ${data.currency}`,
      html,
      text: `You have successfully sent a payment of ${data.amount} ${data.currency} to ${data.recipientName}. Transaction ID: ${data.transactionId}`,
    });
  }

  /**
   * Send payment received notification email
   */
  async sendPaymentReceivedNotification(data: PaymentReceivedNotificationData & { to: string }) {
    const html = this.generatePaymentReceivedNotificationTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject: `Payment Received - ${data.amount} ${data.currency}`,
      html,
      text: `You have received a payment of ${data.amount} ${data.currency} from ${data.senderName || 'a sender'}. Transaction ID: ${data.transactionId}`,
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(data: InvoiceEmailData & { to: string }) {
    const html = this.generateInvoiceEmailTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject: `Invoice ${data.invoiceNumber} - ${data.amount} ${data.currency}`,
      html,
      text: `Invoice ${data.invoiceNumber} for ${data.amount} ${data.currency} is ready. Due date: ${data.dueDate}`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetData & { to: string }) {
    const html = this.generatePasswordResetTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject: 'Reset Your Password - Freelii',
      html,
      text: `Reset your password by clicking this link: ${data.resetLink}. This link expires in ${data.expirationTime}.`,
    });
  }

  /**
   * Send bulk disbursement notification
   */
  async sendBulkDisbursementNotification(data: BulkDisbursementNotificationData & { to: string }) {
    const html = this.generateBulkDisbursementTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject: `Bulk Disbursement Complete - ${data.totalRecipients} recipients`,
      html,
      text: `Your bulk disbursement to ${data.totalRecipients} recipients totaling ${data.totalAmount} ${data.currency} has been completed.`,
    });
  }

  /**
   * Send waitlist confirmation email
   */
  async sendWaitlistConfirmation(data: WaitlistConfirmationData) {
    const html = this.generateWaitlistConfirmationTemplate(data);

    return this.sendEmail({
      to: data.email,
      subject: `Welcome to the Freelii Waitlist! 🚀`,
      html,
      text: `Thank you for joining the Freelii waitlist, ${data.name}! We're excited to have you on board and will keep you updated on our progress.`,
    });
  }

  /**
   * Send sub account created notification email
   */
  async sendSubAccountCreatedNotification(data: SubAccountCreatedData & { to: string }) {
    const html = this.generateSubAccountCreatedTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject: `New Sub Account Created - ${data.accountAlias}`,
      html,
      text: `Your new sub account "${data.accountAlias}" has been successfully created and is ready to use.`,
    });
  }

  /**
   * Send custom email with HTML template
   */
  async sendCustomEmail(to: string | string[], subject: string, htmlContent: string, textContent?: string) {
    return this.sendEmail({
      to,
      subject,
      html: htmlContent,
      text: textContent,
    });
  }

  // Private template generation methods
  private generateWelcomeEmailTemplate(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Freelii</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Freelii!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>We're thrilled to have you join the Freelii community. Our platform makes it easy to manage payments, send invoices, and handle financial transactions with ease.</p>
              
              <p>Here's what you can do with Freelii:</p>
              <ul>
                <li>Send and receive payments globally</li>
                <li>Create and manage invoices</li>
                <li>Track your financial transactions</li>
                <li>Manage recipient information</li>
              </ul>
              
              <p>Ready to get started?</p>
              <a href="https://freelii.com/dashboard" class="button">Go to Dashboard</a>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
              <p>You received this email because you signed up for Freelii.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generatePaymentSentNotificationTemplate(data: PaymentSentNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Sent</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
            .details { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
                      <div class="container">
              <div class="header">
                <h1>✅ Payment Sent Successfully!</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.senderName || 'there'}!</h2>
                <p>Your payment has been sent successfully!</p>
                
                <div class="amount">${data.amount} ${data.currency}</div>
                
                <div class="details">
                  <h3>Payment Details:</h3>
                  <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
                  <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                  <p><strong>Sent to:</strong> ${data.recipientName}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p>Your payment has been processed and the recipient will receive it according to their payment method processing times.</p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
            </div>
          </div>
                </body>
      </html>
    `;
  }

  private generatePaymentReceivedNotificationTemplate(data: PaymentReceivedNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
            .details { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Payment Received!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.recipientName}!</h2>
              <p>Great news! You've received a payment.</p>
              
              <div class="amount">${data.amount} ${data.currency}</div>
              
              <div class="details">
                <h3>Payment Details:</h3>
                <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                ${data.senderName ? `<p><strong>From:</strong> ${data.senderName}</p>` : ''}
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>The payment has been processed and should be available in your account shortly.</p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateInvoiceEmailTemplate(data: InvoiceEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${data.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .invoice-details { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Invoice ${data.invoiceNumber}</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.recipientName}!</h2>
              <p>Please find your invoice details below:</p>
              
              <div class="invoice-details">
                <h3>Invoice Details:</h3>
                <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
                <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
                <p><strong>Due Date:</strong> ${data.dueDate}</p>
                <p><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              ${data.downloadUrl ? `<a href="${data.downloadUrl}" class="button">Download Invoice</a>` : ''}
              
              <p>Please process this payment by the due date to avoid any late fees.</p>
              <p>If you have any questions regarding this invoice, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generatePasswordResetTemplate(data: PasswordResetData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>We received a request to reset your password for your Freelii account.</p>
              
              <a href="${data.resetLink}" class="button">Reset Password</a>
              
              <div class="warning">
                <p><strong>⚠️ Important:</strong> This link will expire in ${data.expirationTime}. If you didn't request this password reset, please ignore this email.</p>
              </div>
              
              <p>For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset link.</p>
              
              <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
              <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${data.resetLink}</p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateBulkDisbursementTemplate(data: BulkDisbursementNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bulk Disbursement Complete</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .summary { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Bulk Disbursement Complete</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.recipientName}!</h2>
              <p>Your bulk disbursement has been successfully processed!</p>
              
              <div class="summary">
                <h3>Disbursement Summary:</h3>
                <p><strong>Total Recipients:</strong> ${data.totalRecipients}</p>
                <p><strong>Total Amount:</strong> ${data.totalAmount} ${data.currency}</p>
                ${data.reference ? `<p><strong>Reference:</strong> ${data.reference}</p>` : ''}
                <p><strong>Processed Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>All payments have been initiated and recipients should receive their funds according to the processing times of their respective payment methods.</p>
              
              <a href="https://freelii.com/dashboard/bulk-disbursements" class="button">View Details</a>
              
              <p>You can track the individual payment statuses in your dashboard.</p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateWaitlistConfirmationTemplate(data: WaitlistConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Freelii Waitlist</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .position-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 15px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .features h3 { color: #667eea; margin-top: 0; }
            .features ul { margin: 0; padding-left: 20px; }
            .features li { margin-bottom: 8px; }
                         .next-steps { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
             .next-steps h3 { color: #0277bd; margin-top: 0; }
             .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            .rocket { font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="rocket">🚀</div>
              <h1>Welcome to the Freelii Waitlist!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">You're now part of something amazing</p>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>Thank you for joining the Freelii waitlist! We're thrilled to have you as part of our early community.</p>
              
              ${data.position ? `<div class="position-badge">🎯 You're #${data.position} on the waitlist!</div>` : ''}
              
              ${data.useCase ? `<p><strong>Your use case:</strong> ${data.useCase}</p>` : ''}
              
              <div class="features">
                <h3>🌟 What's Coming with Freelii</h3>
                <ul>
                  <li><strong>Global Payments</strong> - Send and receive money worldwide with ease</li>
                  <li><strong>Multi-Currency Support</strong> - Handle transactions in multiple currencies</li>
                  <li><strong>Smart Invoicing</strong> - Create professional invoices in seconds</li>
                  <li><strong>Bulk Disbursements</strong> - Pay multiple recipients at once</li>
                  <li><strong>Real-time Tracking</strong> - Monitor all your transactions in real-time</li>
                  <li><strong>Stellar Integration</strong> - Built on the fast and secure Stellar network</li>
                </ul>
              </div>
              
              <div class="next-steps">
                <h3>🎯 What's Next?</h3>
                <p>We're working hard to bring Freelii to life. Here's what you can expect:</p>
                <ul>
                  <li><strong>Regular Updates</strong> - We'll keep you informed about our progress</li>
                  <li><strong>Early Access</strong> - You'll be among the first to try Freelii when we launch</li>
                  <li><strong>Exclusive Features</strong> - Early users get special perks and features</li>
                  <li><strong>Community Input</strong> - Your feedback will help shape the platform</li>
                </ul>
              </div>
              
                             <p>Have questions or suggestions? Simply reply to this email - we'd love to hear from you!</p>
              
              <p>Thanks for believing in our vision,<br>
              <strong>The Freelii Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
              <p>You're receiving this because you joined our waitlist at freelii.app</p>
              <p>If you didn't sign up for this, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateSubAccountCreatedTemplate(data: SubAccountCreatedData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Sub Account Created</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .account-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .account-info h3 { color: #2563eb; margin-top: 0; }
            .account-alias { font-size: 18px; font-weight: bold; color: #2563eb; margin: 15px 0; }
            .features { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .features h3 { color: #0277bd; margin-top: 0; }
            .features ul { margin: 0; padding-left: 20px; }
            .features li { margin-bottom: 8px; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ New Sub Account Created</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.userName}!</h2>
              <p>Great news! Your new sub account has been successfully created and is ready to use.</p>
              
              <div class="account-info">
                <h3>📁 Account Details</h3>
                <p><strong>Account Name:</strong></p>
                <div class="account-alias">${data.accountAlias}</div>
                <p><strong>Created Date:</strong> ${data.createdDate}</p>
                <p><strong>Status:</strong> Active</p>
              </div>
              
              <div class="features">
                <h3>🚀 What You Can Do with Your Sub Account</h3>
                <ul>
                  <li><strong>Organize Transactions</strong> - Keep different types of payments separate</li>
                  <li><strong>Multi-Purpose Management</strong> - Use different accounts for various business needs</li>
                  <li><strong>Easy Switching</strong> - Seamlessly switch between your main and sub accounts</li>
                  <li><strong>Independent Tracking</strong> - Monitor balances and transactions separately</li>
                  <li><strong>Flexible Organization</strong> - Customize how you manage your finances</li>
                </ul>
              </div>
              
              <p>Your sub account is now part of your main account ecosystem and can be accessed from your dashboard. You can send payments, receive funds, and manage transactions just like your main account.</p>
              
              <a href="https://freelii.com/dashboard" class="button">Access Your Account</a>
              
              <p>If you have any questions about using your new sub account, our support team is here to help.</p>
            </div>
            <div class="footer">
              <p>© 2024 Freelii. All rights reserved.</p>
              <p>This email was sent because a new sub account was created for your Freelii account.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}