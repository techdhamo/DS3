/**
 * Scheduled Inventory Sync Endpoint
 * 
 * This endpoint handles scheduled inventory synchronization with all suppliers.
 * It can be called by cron jobs or external scheduling services.
 * 
 * Usage: POST /api/cron/sync-inventory
 * Security: Should be protected with authentication in production
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupplierService } from '../../../lib/supplier/services/SupplierService';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();
const supplierService = new SupplierService(prisma);

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request (add authentication in production)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Initialize suppliers
    await supplierService.initializeSuppliers();

    // Sync inventory for all suppliers
    const syncResults = await supplierService.syncAllInventory();

    // Log results for monitoring
    console.log('Inventory sync completed:', {
      timestamp: new Date().toISOString(),
      results: syncResults,
    });

    // Return summary
    const totalProducts = syncResults.reduce((sum: number, result: any) => sum + result.productsSynced, 0);
    const successCount = syncResults.filter((result: any) => result.success).length;
    const errorCount = syncResults.filter((result: any) => !result.success).length;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSuppliers: syncResults.length,
          successfulSyncs: successCount,
          failedSyncs: errorCount,
          totalProductsSynced: totalProducts,
          syncedAt: new Date().toISOString(),
        },
        details: syncResults,
      },
    });
  } catch (error) {
    console.error('Inventory sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing (remove in production)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');

    if (test !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'GET requests not supported in production',
        },
        { status: 405 }
      );
    }

    // Test sync with a single supplier
    await supplierService.initializeSuppliers();
    const connections = await supplierService.testAllConnections();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Test mode - checking connections',
        connections,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Inventory sync test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
