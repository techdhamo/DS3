import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Razorpay from 'razorpay';

// Initialize Razorpay with error handling
let razorpay: Razorpay | null = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error);
}

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

export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; orderId?: string; error?: string }>> {
  try {
    // Verify user is authenticated
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return NextResponse.json(
        { success: false, error: 'Payment service not configured' },
        { status: 503 }
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

    // Calculate total amount (in paise for Razorpay)
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0);

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        userEmail: session.user.email || '',
        cartData: JSON.stringify(items),
        nextauthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
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
