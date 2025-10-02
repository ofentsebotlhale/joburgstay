import { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { getPaymentHistory, formatCurrency } from '../utils/payment';
import type { PaymentHistory } from '../types/payment';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentHistoryModal({ isOpen, onClose }: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);

  useEffect(() => {
    if (isOpen) {
      const paymentHistory = getPaymentHistory();
      setPayments(paymentHistory);
    }
  }, [isOpen]);

  const getStatusIcon = (status: PaymentHistory['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: PaymentHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 animate-scale-in">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Payment History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Payments Yet</h3>
              <p className="text-slate-400">Your payment history will appear here after making bookings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <h3 className="font-semibold text-white">{payment.method}</h3>
                        <p className="text-sm text-slate-400">Booking: {payment.bookingId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{formatCurrency(payment.amount)}</div>
                      <div className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Reference:</span>
                      <div className="text-white font-mono">{payment.reference}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Date:</span>
                      <div className="text-white">{formatDate(payment.createdAt)}</div>
                    </div>
                    {payment.transactionId && (
                      <div>
                        <span className="text-slate-400">Transaction ID:</span>
                        <div className="text-white font-mono text-xs">{payment.transactionId}</div>
                      </div>
                    )}
                    {payment.completedAt && (
                      <div>
                        <span className="text-slate-400">Completed:</span>
                        <div className="text-white">{formatDate(payment.completedAt)}</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-white font-bold text-lg">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Method:</span>
                  <span className="text-white">{selectedPayment.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-semibold ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Reference:</span>
                  <span className="text-white font-mono">{selectedPayment.reference}</span>
                </div>
                {selectedPayment.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-white font-mono text-sm">{selectedPayment.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                {selectedPayment.completedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Completed:</span>
                    <span className="text-white">{formatDate(selectedPayment.completedAt)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
