/**
 * Supplier Order Client Interface
 * 
 * This interface defines the contract for order management with suppliers.
 * Following SOLID principles, this allows us to add new suppliers without
 * modifying existing core business logic.
 * 
 * Interface Segregation Principle: Only includes order-related operations
 * Dependency Inversion Principle: High-level modules depend on this abstraction
 */

export interface OrderItem {
  supplierSku: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface DropshipOrderRequest {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  customerNotes?: string;
}

export interface DropshipOrderResponse {
  success: boolean;
  supplierOrderId?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  totalAmount: number;
  shippingCost: number;
  errors: string[];
}

export interface OrderStatusResponse {
  supplierOrderId: string;
  status: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  notes?: string;
}

export interface SupplierOrderClient {
  /**
   * Place a dropship order with the supplier
   */
  placeOrder(orderRequest: DropshipOrderRequest): Promise<DropshipOrderResponse>;
  
  /**
   * Get order status from supplier
   */
  getOrderStatus(supplierOrderId: string): Promise<OrderStatusResponse>;
  
  /**
   * Cancel an order (if supported by supplier)
   */
  cancelOrder(supplierOrderId: string): Promise<boolean>;
  
  /**
   * Get tracking information
   */
  getTrackingInfo(supplierOrderId: string): Promise<string | null>;
  
  /**
   * Test order placement (sandbox mode)
   */
  testOrder(): Promise<boolean>;
}
