'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Sword, Loader2 } from 'lucide-react';

// Types
interface CartItem {
  boxThemeId: string;
  quantity: number;
  boxThemeName: string;
  price: number;
}

interface RazorpayCheckoutProps {
  items: CartItem[];
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckout({ 
  items, 
  onPaymentSuccess, 
  onPaymentError, 
  className 
}: RazorpayCheckoutProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!session) {
      onPaymentError?.('Please sign in to continue');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Razorpay order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment order');
      }

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SSdPA3h606fLOj',
        order_id: result.orderId,
        amount: items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0),
        currency: 'INR',
        name: 'DS3 World',
        description: `Mystery Box Purchase - ${items.length} ${items.length === 1 ? 'item' : 'items'}`,
        image: '/favicon.ico',
        handler: function (response: any) {
          console.log('💰 Payment successful:', response);
          // Redirect to success page
          window.location.href = '/checkout/success';
        },
        modal: {
          ondismiss: function () {
            console.log('❌ Payment modal dismissed');
            setIsLoading(false);
          },
        },
        prefill: {
          name: session.user?.name || '',
          email: session.user?.email || '',
        },
        theme: {
          color: '#764ba2',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('❌ Payment error:', error);
      onPaymentError?.(error instanceof Error ? error.message : 'Payment failed');
      setIsLoading(false);
    }
  };

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !session}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Sword className="w-5 h-5" />
          Pay ₹{totalAmount.toLocaleString('en-IN')}
        </>
      )}
    </button>
  );
}
