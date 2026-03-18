import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { ProbabilityEngine } from '../../../../lib/engine/probability';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

// Mock Prisma client for now
const mockPrisma = {
  $transaction: async (callback: any) => {
    // Mock transaction logic
    console.log('🔄 Starting Prisma transaction for webhook fulfillment');
    
    // Mock box theme data
    const mockBoxTheme = {
      id: 'dark-wizard-desk',
      name: "The Dark Wizard's Desk",
      price: 49.99,
      boxItemMappings: [
        { item: { id: '1', name: 'Amethyst Crystal', sku: 'CRYSTAL-001', rarityTier: 'COMMON', stockQuantity: 100 }, dropChance: 25.0, isGuaranteed: false },
        { item: { id: '2', name: 'Dragon Scale Fragment', sku: 'DRAGON-001', rarityTier: 'RARE', stockQuantity: 50 }, dropChance: 12.0, isGuaranteed: false },
        { item: { id: '3', name: 'Crystal Ball Orb', sku: 'ORB-001', rarityTier: 'EPIC', stockQuantity: 25 }, dropChance: 5.0, isGuaranteed: false },
        { item: { id: '4', name: 'Ancient Spell Tome', sku: 'TOME-001', rarityTier: 'MYTHIC', stockQuantity: 10 }, dropChance: 0.5, isGuaranteed: false }
      ]
    };

    // Mock user profile
    const mockProfile = {
      id: 'user-123',
      loyaltyPoints: 1000,
      digitalInventory: []
    };

    // Mock order creation
    const mockOrder = {
      id: 'order-' + Math.random().toString(36).substr(2, 9),
      userId: 'user-123',
      totalAmount: 49.99,
      status: 'PAID',
      createdAt: new Date()
    };

    // Mock order line items
    const mockOrderLineItems: any[] = [];

    // Execute the fulfillment logic
    const result = await callback({
      // Mock Prisma transaction methods
      boxTheme: {
        findUnique: () => mockBoxTheme
      },
      item: {
        findUnique: (params: any) => {
          const item = mockBoxTheme.boxItemMappings.find(mapping => mapping.item.id === params.where.id);
          return item ? item.item : null;
        },
        update: (params: any) => {
          console.log(`📦 Updating item ${params.where.id} stock: -${params.data.stockQuantity.decrement}`);
          return mockBoxTheme.boxItemMappings.find(mapping => mapping.item.id === params.where.id)?.item;
        }
      },
      order: {
        create: (params: any) => {
          console.log(`🛒 Creating order for user ${params.data.userId}`);
          return mockOrder;
        }
      },
      orderLineItem: {
        create: (params: any) => {
          console.log(`📋 Creating order line item with ${params.data.rolledItems.length} items`);
          const lineItem = {
            id: 'lineitem-' + Math.random().toString(36).substr(2, 9),
            ...params.data
          };
          mockOrderLineItems.push(lineItem);
          return lineItem;
        }
      },
      profile: {
        update: (params: any) => {
          console.log(`✨ Updating user profile loyalty points: +${params.data.loyaltyPoints.increment}`);
          mockProfile.loyaltyPoints += params.data.loyaltyPoints.increment;
          return mockProfile;
        }
      }
    });

    return {
      order: mockOrder,
      orderLineItems: mockOrderLineItems,
      updatedProfile: mockProfile
    };
  }
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`🔔 Received Stripe webhook: ${event.type}`);

    // Handle checkout session completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`💰 Payment completed for session: ${session.id}`);
      
      // Extract metadata
      const userId = session.metadata?.userId;
      const cartData = session.metadata?.cartData;
      
      if (!userId || !cartData) {
        console.error('❌ Missing metadata in webhook');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      try {
        // Parse cart data
        const cart = JSON.parse(cartData);
        console.log(`📦 Processing cart for user ${userId}:`, cart);

        // Process each cart item
        for (const item of cart) {
          await processOrderItem(userId, item);
        }

        console.log('✅ Webhook fulfillment completed successfully');
        return NextResponse.json({ received: true });

      } catch (error) {
        console.error('❌ Error processing webhook fulfillment:', error);
        return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
      }
    }

    // Handle other event types
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processOrderItem(userId: string, cartItem: any) {
  console.log(`🎲 Processing order item: ${cartItem.boxThemeName} x${cartItem.quantity}`);

  // Use Prisma transaction for atomic fulfillment
  const result = await mockPrisma.$transaction(async (tx: any) => {
    // Step 1: Fetch box theme with mappings
    const boxTheme = await tx.boxTheme.findUnique({
      where: { id: cartItem.boxThemeId },
      include: { boxItemMappings: { include: { item: true } } }
    });

    if (!boxTheme) {
      throw new Error(`Box theme ${cartItem.boxThemeId} not found`);
    }

    // Step 2: Roll items for each box
    const probabilityEngine = new ProbabilityEngine();
    const allRolledItems = [];

    for (let i = 0; i < cartItem.quantity; i++) {
      const rollResult = probabilityEngine.rollBox(boxTheme);
      allRolledItems.push(...rollResult.rolledItems);
    }

    // Step 3: Verify inventory and deduct stock
    for (const rolledItem of allRolledItems) {
      const item = await tx.item.findUnique({
        where: { id: rolledItem.id }
      });

      if (!item || item.stockQuantity <= 0) {
        throw new Error(`Item ${rolledItem.name} is out of stock`);
      }

      await tx.item.update({
        where: { id: rolledItem.id },
        data: { stockQuantity: { decrement: 1 } }
      });
    }

    // Step 4: Create order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: cartItem.price * cartItem.quantity,
        status: 'PAID',
        shippingAddress: {
          address: '123 Fantasy Lane',
          city: 'Magic City',
          state: 'Realm',
          zipCode: '12345',
          country: 'DS3 World'
        }
      }
    });

    // Step 5: Create order line items
    await tx.orderLineItem.create({
      data: {
        orderId: order.id,
        boxThemeId: cartItem.boxThemeId,
        rolledItems: allRolledItems.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          rarityTier: item.rarityTier
        }))
      }
    });

    // Step 6: Award loyalty points (10% of purchase amount)
    const loyaltyPoints = Math.floor((cartItem.price * cartItem.quantity) * 0.1);
    await tx.profile.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: loyaltyPoints } }
    });

    // Step 7: Add items to user's digital inventory
    // This would be implemented based on your Profile schema
    console.log(`🎁 Awarded ${allRolledItems.length} items to user ${userId}`);
    console.log(`💎 Awarded ${loyaltyPoints} Mana points to user ${userId}`);

    return {
      order,
      rolledItems: allRolledItems,
      loyaltyPoints
    };
  });

  console.log(`✅ Order processed successfully. Order ID: ${result.order.id}`);
  return result;
}
