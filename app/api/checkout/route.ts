import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

// Types
interface CartItem {
  boxThemeId: string;
  quantity: number;
  boxThemeName: string;
  price: number;
}

interface CheckoutRequest {
  items: CartItem[];
}

export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; checkoutUrl?: string; error?: string }>> {
  try {
    // Verify user is authenticated
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use email as user identifier for now
    const userId = session.user.email;

    const body: CheckoutRequest = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate cart items
    for (const item of items) {
      if (!item.boxThemeId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: 'Invalid cart item' },
          { status: 400 }
        );
      }
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL'],
      },
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.boxThemeName,
            description: `Mystery Box - ${item.quantity} ${item.quantity === 1 ? 'box' : 'boxes'}`,
            images: [], // Add box images if available
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      metadata: {
        userId: userId,
        userEmail: session.user.email || '',
        cartData: JSON.stringify(items),
      },
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/cancel`,
      allow_promotion_codes: true,
      customer_creation: 'always',
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url || undefined,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during checkout'
      },
      { status: 500 }
    );
  }
}
