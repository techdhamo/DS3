import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Types
interface CartItem {
  boxThemeId: string;
  quantity: number;
  boxThemeName: string;
  price: number; // Price in INR
}

interface CreateOrderRequest {
  items: CartItem[];
}

export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; order?: any; error?: string }>> {
  try {
    // Verify user is authenticated
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: CreateOrderRequest = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total amount (in paisa, Razorpay uses smallest currency unit)
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0);

    // Create Razorpay order
    const orderOptions = {
      amount: totalAmount,
      currency: 'INR',
      receipt: `ds3_order_${Date.now()}`,
      notes: {
        userId: session.user.email,
        cartData: JSON.stringify(items),
        platform: 'ds3-world'
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    console.log(`💰 Created Razorpay order: ${order.id} for ${session.user.email}`);
    console.log(`📦 Cart items: ${items.length} boxes, total: ₹${totalAmount / 100}`);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        name: 'DS3 World',
        description: `Mystery Box Purchase - ${items.length} box(es)`,
        image: 'https://ds3.store/logo.png', // Add your logo URL
        prefill: {
          name: session.user.name || 'DS3 Player',
          email: session.user.email,
          contact: '' // Optional: Add phone if available
        },
        notes: order.notes,
        theme: {
          color: '#8B5CF6' // Purple theme to match DS3 branding
        }
      }
    });

  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment order'
      },
      { status: 500 }
    );
  }
}
