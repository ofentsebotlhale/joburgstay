export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'eft' | 'cash' | 'instant';
  icon: string;
  description: string;
  processingFee: number;
  available: boolean;
}

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  currency: 'ZAR';
  reference: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  message: string;
  paymentUrl?: string;
  qrCode?: string;
}

export interface EFTDetails {
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountHolder: string;
  reference: string;
  amount: number;
}

export interface CashPaymentDetails {
  amount: number;
  reference: string;
  instructions: string;
  contactNumber: string;
}

export interface PaymentHistory {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  reference: string;
  transactionId?: string;
}
