import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';

// Mock PrismaClient for now until we fix import issues
const prisma = {
  // Mock implementation - will be replaced with actual PrismaClient
};

export const authOptions: any = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [identifier],
            subject: 'Sign in to DS3 World',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
                  <h1 style="color: white; text-align: center; margin-bottom: 30px;">🎮 DS3 World</h1>
                  <h2 style="color: white; text-align: center; margin-bottom: 20px;">Welcome to the Mystery Box Gaming Platform!</h2>
                  
                  <p style="color: white; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Click the button below to sign in to your DS3 World account and start your gaming adventure!
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="
                      background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                      color: white;
                      padding: 15px 40px;
                      text-decoration: none;
                      border-radius: 50px;
                      font-weight: bold;
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                      transition: all 0.3s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                      🚀 Sign In to DS3 World
                    </a>
                  </div>
                  
                  <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-top: 30px;">
                    <h3 style="color: white; margin-bottom: 15px;">🎁 What awaits you in DS3 World:</h3>
                    <ul style="color: white; line-height: 1.8;">
                      <li>🎲 Mystery boxes with rare items</li>
                      <li>🏰 Fantasy-themed gaming experience</li>
                      <li>💰 Secure Razorpay payments</li>
                      <li>👥 Multiplayer dungeon raids</li>
                      <li>📊 Player profiles and inventory</li>
                    </ul>
                  </div>
                  
                  <p style="color: white; text-align: center; margin-top: 30px; font-size: 14px; opacity: 0.8;">
                    This link expires in 24 hours. If you didn't request this email, you can safely ignore it.
                  </p>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <p style="color: white; font-size: 12px; margin: 0;">
                      © 2024 DS3 World - Your Gaming Adventure Starts Here! 🎮
                    </p>
                  </div>
                </div>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send verification email');
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }: any) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: async ({ user, token }: any) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
