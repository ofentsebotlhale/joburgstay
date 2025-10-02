import type { PaymentMethod, PaymentResult, EFTDetails, CashPaymentDetails, PaymentHistory } from '../types/payment';

// South African Payment Methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'payfast',
    name: 'PayFast',
    type: 'instant',
    icon: '💳',
    description: 'Secure online payments with cards, EFT, and mobile wallets',
    processingFee: 0.035, // 3.5%
    available: true
  },
  {
    id: 'yoco',
    name: 'Yoco',
    type: 'card',
    icon: '🏪',
    description: 'Card payments and mobile payments',
    processingFee: 0.029, // 2.9%
    available: true
  },
  {
    id: 'eft',
    name: 'Bank Transfer (EFT)',
    type: 'eft',
    icon: '🏦',
    description: 'Direct bank transfer - no processing fees',
    processingFee: 0,
    available: true
  },
  {
    id: 'cash',
    name: 'Cash on Arrival',
    type: 'cash',
    icon: '💵',
    description: 'Pay in cash when you arrive',
    processingFee: 0,
    available: true
  }
];

// Generate payment reference
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BH${timestamp}${random}`.toUpperCase();
}

// Calculate total with processing fees
export function calculatePaymentTotal(amount: number, method: PaymentMethod): number {
  // Validate inputs
  if (!amount || isNaN(amount) || amount <= 0) {
    console.error('Invalid amount provided to calculatePaymentTotal:', amount);
    return 0;
  }
  
  if (!method || typeof method.processingFee !== 'number') {
    console.error('Invalid payment method provided:', method);
    return amount;
  }
  
  const fee = amount * method.processingFee;
  const total = amount + fee;
  return Math.round(total * 100) / 100;
}

// Format currency for South Africa
export function formatCurrency(amount: number): string {
  if (!amount || isNaN(amount)) {
    return 'R0.00';
  }
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
}

// Generate EFT payment details
export function generateEFTDetails(amount: number, reference: string): EFTDetails {
  return {
    bankName: 'Standard Bank',
    accountNumber: '1234567890',
    branchCode: '051001',
    accountHolder: 'Blue Haven on 13th Emperor',
    reference: reference,
    amount: amount
  };
}

// Generate cash payment details
export function generateCashPaymentDetails(amount: number, reference: string): CashPaymentDetails {
  return {
    amount: amount,
    reference: reference,
    instructions: 'Please bring exact cash amount. Contact us 24 hours before arrival to confirm payment method.',
    contactNumber: '+27 11 123 4567'
  };
}

// Simulate PayFast payment
export async function processPayFastPayment(amount: number, reference: string): Promise<PaymentResult> {
  // In a real implementation, this would integrate with PayFast API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `PF${Date.now()}`,
        reference: reference,
        message: 'Payment processed successfully',
        paymentUrl: `https://payfast.co.za/eng/process?ref=${reference}`
      });
    }, 1000);
  });
}

// Simulate Yoco payment
export async function processYocoPayment(amount: number, reference: string): Promise<PaymentResult> {
  // In a real implementation, this would integrate with Yoco API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `YC${Date.now()}`,
        reference: reference,
        message: 'Payment processed successfully'
      });
    }, 1000);
  });
}

// Process EFT payment (manual verification)
export async function processEFTPayment(amount: number, reference: string): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        reference: reference,
        message: 'EFT payment details generated. Please complete the transfer and send proof of payment.',
        qrCode: `data:image/svg+xml;base64,${btoa(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
              EFT Payment QR
            </text>
            <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="10">
              Ref: ${reference}
            </text>
          </svg>
        `)}`
      });
    }, 500);
  });
}

// Process cash payment
export async function processCashPayment(amount: number, reference: string): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        reference: reference,
        message: 'Cash payment confirmed. Please bring exact amount on arrival.'
      });
    }, 500);
  });
}

// Save payment to Supabase (with localStorage fallback)
export async function savePayment(payment: PaymentHistory): Promise<void> {
  try {
    // Try Supabase first
    const { DatabaseService } = await import('../services/database');
    await DatabaseService.addPayment(payment.bookingId, {
      success: payment.status === 'completed',
      reference: payment.reference,
      method: payment.method,
      amount: payment.amount,
      fee: payment.fee || 0,
      totalPaid: payment.totalPaid,
      timestamp: payment.createdAt,
      message: payment.message
    });
  } catch (error) {
    console.error('Supabase payment save failed, using localStorage:', error);
    // Fallback to localStorage
    try {
      const payments = getPaymentHistory();
      payments.push(payment);
      localStorage.setItem('blueHavenPayments', JSON.stringify(payments));
    } catch (fallbackError) {
      console.error('Error saving payment to localStorage:', fallbackError);
    }
  }
}

// Get payment history
export function getPaymentHistory(): PaymentHistory[] {
  try {
    const payments = localStorage.getItem('blueHavenPayments');
    return payments ? JSON.parse(payments) : [];
  } catch (error) {
    console.error('Error getting payment history:', error);
    return [];
  }
}

// Get payment by booking ID
export function getPaymentByBookingId(bookingId: string): PaymentHistory | null {
  const payments = getPaymentHistory();
  return payments.find(p => p.bookingId === bookingId) || null;
}

// Update payment status
export function updatePaymentStatus(paymentId: string, status: PaymentHistory['status']): void {
  try {
    const payments = getPaymentHistory();
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = status;
      if (status === 'completed') {
        payment.completedAt = new Date().toISOString();
      }
      localStorage.setItem('blueHavenPayments', JSON.stringify(payments));
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}
