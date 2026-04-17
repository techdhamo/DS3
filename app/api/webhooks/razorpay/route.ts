import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
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

/**
 * POST /api/webhooks/razorpay
 * 
 * Handles Razorpay webhook events for payment processing
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if Razorpay is configured
    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay not configured');
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
    }

    // Get webhook body
    const body = await request.text();
    
    // Get Razorpay signature
    const headersList = await headers();
    const razorpay_signature = headersList.get('x-razorpay-signature');

    if (!razorpay_signature) {
      console.error('❌ Missing Razorpay signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (razorpay_signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook body
    const webhookBody = JSON.parse(body);
    console.log(`🔔 Received Razorpay webhook: ${webhookBody.event}`);

    // Handle payment captured event
    if (webhookBody.event === 'payment.captured') {
      const payment = webhookBody.payload.payment.entity;
      
      console.log(`💰 Payment captured: ${payment.id} for ₹${payment.amount / 100}`);
      
      // Extract order details
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount;
      const notes = payment.notes;

      if (!notes?.userId || !notes?.cartData) {
        console.error('❌ Missing notes in webhook');
        return NextResponse.json({ error: 'Missing order metadata' }, { status: 400 });
      }

      try {
        // Parse cart data
        const cart = JSON.parse(notes.cartData);
        console.log(`📦 Processing cart for user ${notes.userId}:`, cart);

        // Import PrismaClient dynamically
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        try {
          // Process payment with real database transaction
          await prisma.$transaction(async (tx) => {
            // Process each cart item
            for (const item of cart) {
              await processOrderItem(notes.userId, item, orderId, paymentId, tx);
            }
          });

          console.log('✅ Razorpay webhook fulfillment completed successfully');
          return NextResponse.json({ received: true });

        } finally {
          await prisma.$disconnect();
        }

      } catch (error) {
        console.error('❌ Error processing Razorpay webhook fulfillment:', error);
        return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
      }
    }

    // Handle other events
    console.log(`ℹ️ Received unhandled event: ${webhookBody.event}`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processOrderItem(
  userId: string, 
  cartItem: any, 
  orderId: string, 
  paymentId: string,
  tx: any
) {
  console.log(`🎲 Processing item: ${cartItem.boxThemeName} x${cartItem.quantity}`);

  // Step 1: Fetch box theme
  const boxTheme = await tx.boxTheme.findUnique({
    where: { id: cartItem.boxThemeId },
    include: {
      boxItemMappings: {
        include: { item: true },
        orderBy: { dropChance: 'desc' }
      }
    }
  });

  if (!boxTheme) {
    throw new Error(`Box theme ${cartItem.boxThemeId} not found`);
  }

  // Step 2: Roll the mystery boxes
  const { ProbabilityEngine } = await import('../../../../lib/engine/probability');
  const probabilityEngine = new ProbabilityEngine();
  const allRolledItems = [];

  for (let i = 0; i < cartItem.quantity; i++) {
    const rollResult = probabilityEngine.rollBox(boxTheme as any);
    allRolledItems.push(...rollResult.rolledItems);
  }

  // Step 3: Create order
  const order = await tx.order.create({
    data: {
      userId,
      totalAmount: cartItem.price * cartItem.quantity,
      status: 'PAID',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      shippingAddress: {
        address: '123 Fantasy Lane',
        city: 'Magic City',
        state: 'Realm',
        zipCode: '12345',
        country: 'DS3 World'
      }
    }
  });

  // Step 4: Create order line items and update inventory
  for (const rolledItem of allRolledItems) {
    // Create order line item
    await tx.orderLineItem.create({
      data: {
        orderId: order.id,
        boxThemeId: cartItem.boxThemeId,
        rolledItems: [{
          id: rolledItem.id,
          name: rolledItem.name,
          sku: rolledItem.sku,
          rarityTier: rolledItem.rarityTier
        }]
      }
    });

    // Update inventory
    await tx.item.update({
      where: { id: rolledItem.id },
      data: { stockQuantity: { decrement: 1 } }
    });
  }

  // Step 5: Award loyalty points (5% of purchase amount)
  const loyaltyPoints = Math.floor((cartItem.price * cartItem.quantity) * 0.05);
  await tx.profile.update({
    where: { id: userId },
    data: { loyaltyPoints: { increment: loyaltyPoints } }
  });

  console.log(`🎁 Awarded ${allRolledItems.length} items to user ${userId}`);
  console.log(`💎 Awarded ${loyaltyPoints} Mana points to user ${userId}`);
}
