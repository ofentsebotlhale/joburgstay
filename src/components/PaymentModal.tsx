import { useState, useEffect } from 'react';
import { X, CreditCard, Building2, Banknote, Smartphone, CheckCircle, AlertCircle, Copy, QrCode } from 'lucide-react';
import type { PaymentMethod, PaymentResult, EFTDetails, CashPaymentDetails } from '../types/payment';
import { 
  PAYMENT_METHODS, 
  generatePaymentReference, 
  calculatePaymentTotal, 
  formatCurrency,
  generateEFTDetails,
  generateCashPaymentDetails,
  processPayFastPayment,
  processYocoPayment,
  processEFTPayment,
  processCashPayment,
  savePayment
} from '../utils/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  bookingId: string;
  onSuccess: (result: PaymentResult) => void;
  onError: (message: string) => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  bookingId, 
  onSuccess, 
  onError 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [eftDetails, setEftDetails] = useState<EFTDetails | null>(null);
  const [cashDetails, setCashDetails] = useState<CashPaymentDetails | null>(null);
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (isOpen) {
      console.log('PaymentModal opened with amount:', amount, 'bookingId:', bookingId);
      setReference(generatePaymentReference());
      setSelectedMethod(null);
      setPaymentResult(null);
      setEftDetails(null);
      setCashDetails(null);
      
      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        console.error('Invalid amount provided to PaymentModal:', amount);
        onError('Invalid payment amount. Please try booking again.');
        onClose();
        return;
      }
    }
  }, [isOpen, amount, onError, onClose]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentResult(null);
    
    if (method.type === 'eft') {
      setEftDetails(generateEFTDetails(amount, reference));
    } else if (method.type === 'cash') {
      setCashDetails(generateCashPaymentDetails(amount, reference));
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    
    try {
      let result: PaymentResult;

      switch (selectedMethod.id) {
        case 'payfast':
          result = await processPayFastPayment(amount, reference);
          break;
        case 'yoco':
          result = await processYocoPayment(amount, reference);
          break;
        case 'eft':
          result = await processEFTPayment(amount, reference);
          break;
        case 'cash':
          result = await processCashPayment(amount, reference);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      if (result.success) {
        // Save payment record
        savePayment({
          id: result.transactionId || `PAY_${Date.now()}`,
          bookingId,
          amount: calculatePaymentTotal(amount, selectedMethod),
          method: selectedMethod.name,
          status: selectedMethod.type === 'eft' || selectedMethod.type === 'cash' ? 'pending' : 'completed',
          createdAt: new Date().toISOString(),
          completedAt: selectedMethod.type === 'eft' || selectedMethod.type === 'cash' ? undefined : new Date().toISOString(),
          reference: result.reference || reference,
          transactionId: result.transactionId
        });

        setPaymentResult(result);
        onSuccess(result);
      } else {
        onError(result.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
      case 'instant':
        return <CreditCard className="w-6 h-6" />;
      case 'eft':
        return <Building2 className="w-6 h-6" />;
      case 'cash':
        return <Banknote className="w-6 h-6" />;
      default:
        return <Smartphone className="w-6 h-6" />;
    }
  };

  if (!isOpen) return null;

  const totalAmount = selectedMethod ? calculatePaymentTotal(amount, selectedMethod) : amount;
  const processingFee = selectedMethod ? totalAmount - amount : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 animate-scale-in">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!paymentResult ? (
            <>
              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Booking Amount:</span>
                    <span className="text-white font-semibold">{formatCurrency(amount)}</span>
                  </div>
                  {selectedMethod && processingFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Processing Fee:</span>
                      <span className="text-white font-semibold">{formatCurrency(processingFee)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-2xl font-bold text-blue-400">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Choose Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-2xl">{method.icon}</div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-white">{method.name}</h4>
                          <p className="text-sm text-slate-400">{method.description}</p>
                        </div>
                      </div>
                      {method.processingFee > 0 && (
                        <div className="text-xs text-slate-500">
                          Fee: {(method.processingFee * 100).toFixed(1)}%
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* EFT Details */}
              {eftDetails && (
                <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span>Bank Transfer Details</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Bank:</span>
                      <span className="text-white font-semibold">{eftDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Account Number:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{eftDetails.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(eftDetails.accountNumber)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Branch Code:</span>
                      <span className="text-white font-semibold">{eftDetails.branchCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Reference:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{eftDetails.reference}</span>
                        <button
                          onClick={() => copyToClipboard(eftDetails.reference)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-white font-semibold">{formatCurrency(eftDetails.amount)}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      Please use the exact reference number when making the transfer. 
                      Send proof of payment to info@bluehaven.co.za
                    </p>
                  </div>
                </div>
              )}

              {/* Cash Payment Details */}
              {cashDetails && (
                <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Banknote className="w-5 h-5 text-green-400" />
                    <span>Cash Payment</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-white font-semibold">{formatCurrency(cashDetails.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Reference:</span>
                      <span className="text-white font-semibold">{cashDetails.reference}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Contact:</span>
                      <span className="text-white font-semibold">{cashDetails.contactNumber}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">{cashDetails.instructions}</p>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              {selectedMethod && (
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
                </button>
              )}
            </>
          ) : (
            /* Payment Result */
            <div className="text-center">
              <div className="mb-6">
                {paymentResult.success ? (
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                )}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                </h3>
                <p className="text-slate-400 mb-4">{paymentResult.message}</p>
              </div>

              {paymentResult.paymentUrl && (
                <div className="mb-6">
                  <a
                    href={paymentResult.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                  >
                    Complete Payment
                  </a>
                </div>
              )}

              {paymentResult.qrCode && (
                <div className="mb-6">
                  <img src={paymentResult.qrCode} alt="Payment QR Code" className="mx-auto" />
                </div>
              )}

              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-white mb-2">Payment Details</h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <div>Reference: {paymentResult.reference}</div>
                  {paymentResult.transactionId && (
                    <div>Transaction ID: {paymentResult.transactionId}</div>
                  )}
                  <div>Amount: {formatCurrency(totalAmount)}</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
