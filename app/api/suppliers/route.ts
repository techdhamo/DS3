/**
 * Suppliers API Route
 * 
 * REST endpoints for supplier management operations.
 * This controller handles HTTP requests and delegates to the SupplierService.
 * 
 * Following Clean Architecture principles:
 * - Controller layer handles HTTP concerns
 * - Business logic is delegated to service layer
 * - Dependencies are injected and inverted
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupplierService } from '../../../lib/supplier/services/SupplierService';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();
const supplierService = new SupplierService(prisma);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'products':
        // Get all supplier products
        const products = await supplierService.getAllSupplierProducts();
        return NextResponse.json({
          success: true,
          data: products,
        });

      case 'test-connections':
        // Test all supplier connections
        const connections = await supplierService.testAllConnections();
        return NextResponse.json({
          success: true,
          data: connections,
        });

      case 'sync-status':
        // Get sync status for all suppliers
        // TODO: Uncomment after schema is pushed
        // const suppliers = await prisma.supplier.findMany({
        //   select: {
        //     id: true,
        //     name: true,
        //     type: true,
        //     isActive: true,
        //     lastSyncAt: true,
        //   },
        // });
        const suppliers: any[] = []; // Mock data for now
        return NextResponse.json({
          success: true,
          data: suppliers,
        });

      default:
        // Get all suppliers
        // TODO: Uncomment after schema is pushed
        // const suppliersList = await prisma.supplier.findMany({
        //   where: { isActive: true },
        //   orderBy: { name: 'asc' },
        // });
        const suppliersList: any[] = []; // Mock data for now
        return NextResponse.json({
          success: true,
          data: suppliersList,
        });
    }
  } catch (error) {
    console.error('Suppliers GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'sync-inventory':
        // Sync inventory for all suppliers
        const syncResults = await supplierService.syncAllInventory();
        return NextResponse.json({
          success: true,
          data: syncResults,
        });

      case 'sync-single':
        // Sync inventory for a specific supplier
        const { supplierId } = body;
        if (!supplierId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Supplier ID is required',
            },
            { status: 400 }
          );
        }

        const singleSyncResult = await supplierService.syncSupplierInventory(supplierId);
        return NextResponse.json({
          success: true,
          data: singleSyncResult,
        });

      case 'place-order':
        // Place a dropship order
        const orderResult = await supplierService.placeDropshipOrder(body.orderData);
        return NextResponse.json({
          success: orderResult.success,
          data: orderResult,
        });

      case 'test-connection':
        // Test connection for a specific supplier
        const { supplierId: testSupplierId } = body;
        if (!testSupplierId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Supplier ID is required',
            },
            { status: 400 }
          );
        }

        // Initialize the specific supplier and test connection
        const supplier = await prisma.supplier.findUnique({
          where: { id: testSupplierId },
        });

        if (!supplier) {
          return NextResponse.json(
            {
              success: false,
              error: 'Supplier not found',
            },
            { status: 404 }
          );
        }

        await supplierService.initializeSupplier(supplier);
        const connections = await supplierService.testAllConnections();
        const result = connections.find(c => c.supplierId === testSupplierId);

        return NextResponse.json({
          success: true,
          data: result,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Suppliers POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supplier ID is required',
        },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Suppliers PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supplier ID is required',
        },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Suppliers DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
