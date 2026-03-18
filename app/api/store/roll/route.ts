import { NextRequest, NextResponse } from 'next/server';
import { ProbabilityEngine, BoxThemeWithMappings } from '../../../../lib/engine/probability';

// Types for the API
interface RollRequest {
  userId: string;
  boxThemeId: string;
  quantity?: number; // Allow multiple boxes in one order
}

interface RollResponse {
  success: boolean;
  order?: {
    id: string;
    totalAmount: number;
    status: string;
    orderLineItems: Array<{
      id: string;
      boxThemeId: string;
      rolledItems: any[];
      boxTheme: {
        name: string;
        price: number;
      };
    }>;
  };
  error?: string;
  message?: string;
}

/**
 * POST /api/store/roll
 * 
 * Handles the mystery box purchase and rolling process
 * Uses database transactions to ensure inventory integrity
 */
export async function POST(request: NextRequest): Promise<NextResponse<RollResponse>> {
  try {
    const body: RollRequest = await request.json();
    const { userId, boxThemeId, quantity = 1 } = body;

    // Validate input
    if (!userId || !boxThemeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId and boxThemeId' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Import PrismaClient dynamically
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { Pool } = await import('pg');
    
    // Initialize database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
      // Use a transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx: any) => {
        // Step 1: Fetch the box theme with mappings and verify availability
        const boxTheme = await tx.boxTheme.findUnique({
          where: { id: boxThemeId },
          include: {
            boxItemMappings: {
              include: { item: true },
              orderBy: { dropChance: 'desc' }
            }
          }
        });

        if (!boxTheme) {
          throw new Error(`Box theme with ID ${boxThemeId} not found`);
        }

        if (!boxTheme.isActive) {
          throw new Error(`Box theme ${boxTheme.name} is not active`);
        }

        if (boxTheme.isSoldOut) {
          throw new Error(`Box theme ${boxTheme.name} is sold out`);
        }

        // Step 2: Roll the mystery boxes using the probability engine
        const probabilityEngine = new ProbabilityEngine();
        const rollResults = [];
        
        for (let i = 0; i < quantity; i++) {
          const rollResult = probabilityEngine.rollBox(boxTheme as BoxThemeWithMappings);
          
          // Step 3: Verify inventory availability for all rolled items
          for (const rolledItem of rollResult.rolledItems) {
            const currentItem = await tx.item.findUnique({
              where: { id: rolledItem.id }
            });

            if (!currentItem) {
              throw new Error(`Item ${rolledItem.name} not found`);
            }

            if (currentItem.stockQuantity <= 0) {
              throw new Error(`Item ${rolledItem.name} is out of stock`);
            }
          }

          rollResults.push(rollResult);
        }

        // Step 4: Calculate total amount
        const totalAmount = Number(boxTheme.price) * quantity;

        // Step 5: Create the order
        const order = await tx.order.create({
          data: {
            userId,
            totalAmount,
            status: 'PAID', // In a real app, this would be PENDING until payment confirmation
            shippingAddress: {
              // This would come from user profile or checkout form
              address: '123 Fantasy Lane',
              city: 'Magic City',
              state: 'Realm',
              zipCode: '12345',
              country: 'DS3 World'
            }
          }
        });

        // Step 6: Create order line items and update inventory
        const orderLineItems = [];
        
        for (let i = 0; i < rollResults.length; i++) {
          const rollResult = rollResults[i];
          
          // Create order line item with rolled items
          const orderLineItem = await tx.orderLineItem.create({
            data: {
              orderId: order.id,
              boxThemeId: boxTheme.id,
              rolledItems: rollResult.rolledItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                sku: item.sku,
                rarityTier: item.rarityTier
              }))
            }
          });

          // Update inventory for each rolled item
          for (const rolledItem of rollResult.rolledItems) {
            await tx.item.update({
              where: { id: rolledItem.id },
              data: {
                stockQuantity: {
                  decrement: 1
                }
              }
            });
          }

          orderLineItems.push({
            ...orderLineItem,
            rolledItems: rollResult.rolledItems,
            boxTheme: {
              name: boxTheme.name,
              price: Number(boxTheme.price)
            }
          });
        }

        // Step 7: Check if any items are now out of stock and update box theme if needed
        const remainingItems = await tx.item.findMany({
          where: {
            stockQuantity: {
              lt: 1
            }
          },
          include: {
            boxItemMappings: true
          }
        });

        // Mark boxes as sold out if they contain out-of-stock guaranteed items
        for (const item of remainingItems) {
          const guaranteedMappings = item.boxItemMappings.filter((mapping: any) => mapping.isGuaranteed);
          
          for (const mapping of guaranteedMappings) {
            await tx.boxTheme.update({
              where: { id: mapping.boxThemeId },
              data: { isSoldOut: true }
            });
          }
        }

        return {
          order: {
            id: order.id,
            totalAmount: Number(order.totalAmount),
            status: order.status,
            orderLineItems
          }
        };
      });

      return NextResponse.json({
        success: true,
        ...result
      });

    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);
      
      // Handle specific error cases
      const errorMessage = transactionError instanceof Error 
        ? transactionError.message 
        : 'Unknown error occurred';

      // Determine appropriate HTTP status code
      let statusCode = 500;
      if (errorMessage.includes('not found')) {
        statusCode = 404;
      } else if (errorMessage.includes('out of stock') || errorMessage.includes('not active') || errorMessage.includes('sold out')) {
        statusCode = 409; // Conflict
      } else if (errorMessage.includes('Missing required fields') || errorMessage.includes('Quantity must be between')) {
        statusCode = 400;
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          message: statusCode === 409 ? 'Please try again later or contact support if the issue persists.' : undefined
        },
        { status: statusCode }
      );

    } finally {
      await prisma.$disconnect();
      await pool.end();
    }

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/store/roll
 * 
 * Health check endpoint for the roll API
 */
export async function GET(): Promise<NextResponse<{ status: string; timestamp: string }>> {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
