// 📧 DS3 World Email Service (Resend.com)
// Handles all email communications for the gaming platform

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface WelcomeEmailOptions {
  to: string;
  userName?: string;
  loginUrl: string;
}

interface PurchaseConfirmationOptions {
  to: string;
  userName?: string;
  orderDetails: {
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  };
}

interface PasswordResetOptions {
  to: string;
  resetUrl: string;
  userName?: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@ds3.world';
    
    if (!this.apiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured');
    }
  }

  /**
   * Send email using Resend API
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error('Resend API key not configured');
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from || this.fromEmail,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('✅ Email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  /**
   * Welcome email for new users
   */
  async sendWelcomeEmail(options: WelcomeEmailOptions): Promise<boolean> {
    const { userName = 'Adventurer', loginUrl } = options;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h1 style="color: white; text-align: center; margin-bottom: 30px;">🎮 Welcome to DS3 World!</h1>
          
          <h2 style="color: white; text-align: center; margin-bottom: 20px;">Hello, ${userName}! 🎉</h2>
          
          <p style="color: white; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Your adventure in the world of mystery boxes and fantasy gaming begins now! 
            DS3 World is thrilled to have you join our community of gamers and collectors.
          </p>
          
          <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="color: white; margin-bottom: 15px;">🎁 What you can do:</h3>
            <ul style="color: white; line-height: 1.8;">
              <li>🎲 Open mystery boxes with rare items</li>
              <li>🏰 Explore fantasy-themed collections</li>
              <li>💳 Make secure payments with Razorpay</li>
              <li>👥 Join multiplayer dungeon raids</li>
              <li>📊 Track your inventory and achievements</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="
              background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 18px;
              display: inline-block;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            ">
              🚀 Start Your Adventure
            </a>
          </div>
          
          <p style="color: white; text-align: center; margin-top: 30px; font-size: 14px; opacity: 0.8;">
            Questions? Reply to this email - we're here to help!
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="color: white; font-size: 12px; margin: 0;">
              © 2024 DS3 World - Your Gaming Adventure Starts Here! 🎮
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: options.to,
      subject: '🎮 Welcome to DS3 World - Start Your Adventure!',
      html,
    });
  }

  /**
   * Purchase confirmation email
   */
  async sendPurchaseConfirmation(options: PurchaseConfirmationOptions): Promise<boolean> {
    const { userName = 'Adventurer', orderDetails } = options;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h1 style="color: white; text-align: center; margin-bottom: 30px;">🎉 Purchase Confirmed!</h1>
          
          <h2 style="color: white; text-align: center; margin-bottom: 20px;">Thank you, ${userName}! 💰</h2>
          
          <p style="color: white; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Your mystery box purchase has been successfully processed! 
            Your items are ready to be opened in your DS3 World inventory.
          </p>
          
          <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="color: white; margin-bottom: 15px;">📦 Order Details:</h3>
            <p style="color: white; margin: 5px 0;"><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            
            <div style="margin: 15px 0;">
              <strong style="color: white;">Items:</strong>
              ${orderDetails.items.map(item => `
                <div style="color: white; margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                  ${item.name} x ${item.quantity} - ₹${item.price}
                </div>
              `).join('')}
            </div>
            
            <p style="color: white; margin: 15px 0; font-size: 18px; font-weight: bold;">
              Total: ₹${orderDetails.totalAmount}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ds3.world/dashboard" style="
              background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 18px;
              display: inline-block;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            ">
              🎁 Open Your Mystery Boxes
            </a>
          </div>
          
          <p style="color: white; text-align: center; margin-top: 30px; font-size: 14px; opacity: 0.8;">
            Questions about your order? We're here to help!
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="color: white; font-size: 12px; margin: 0;">
              © 2024 DS3 World - Your Gaming Adventure Starts Here! 🎮
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: options.to,
      subject: `🎉 Order Confirmed - ${orderDetails.orderId}`,
      html,
    });
  }

  /**
   * Password reset email
   */
  async sendPasswordReset(options: PasswordResetOptions): Promise<boolean> {
    const { resetUrl, userName = 'Adventurer' } = options;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h1 style="color: white; text-align: center; margin-bottom: 30px;">🔐 Reset Your Password</h1>
          
          <h2 style="color: white; text-align: center; margin-bottom: 20px;">Hello, ${userName}!</h2>
          
          <p style="color: white; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your DS3 World password. 
            Click the button below to securely reset your password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="
              background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 18px;
              display: inline-block;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            ">
              🔑 Reset Password
            </a>
          </div>
          
          <div style="background: rgba(255,0,0,0.2); padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p style="color: white; font-size: 14px; margin: 0;">
              <strong>⚠️ Security Notice:</strong> This link expires in 1 hour. 
              If you didn't request this reset, please ignore this email.
            </p>
          </div>
          
          <p style="color: white; text-align: center; margin-top: 30px; font-size: 14px; opacity: 0.8;">
            Need help? Reply to this email for support.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="color: white; font-size: 12px; margin: 0;">
              © 2024 DS3 World - Your Gaming Adventure Starts Here! 🎮
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: options.to,
      subject: '🔐 Reset Your DS3 World Password',
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for use in other files
export type { EmailOptions, WelcomeEmailOptions, PurchaseConfirmationOptions, PasswordResetOptions };
