import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, User, Mail, Phone, Users, MessageSquare, Sparkles, CreditCard, Clock } from 'lucide-react';
import EnhancedCalendar from './EnhancedCalendar';
import CheckInTimeSelector from './CheckInTimeSelector';
import PaymentModal from './PaymentModal';
import { getBlockedDates, calculateTotal, daysBetween, formatDate, addBooking } from '../utils/booking';
import { sendBookingNotifications } from '../utils/emailjs';
import { GoogleAnalytics } from '../utils/analytics';
import type { BookingFormData } from '../types/booking';
import type { PaymentResult } from '../types/payment';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onInfo: (message: string) => void;
}

export default function BookingModal({ isOpen, onClose, onSuccess, onError, onInfo }: BookingModalProps) {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    checkInTime: '15:00',
    specialRequests: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadBlockedDates();
      GoogleAnalytics.trackBookingStarted();
    }
  }, [isOpen]);

  const loadBlockedDates = async () => {
    const dates = await getBlockedDates();
    setBlockedDates(dates);
  };

  const handleDateSelect = (dateStr: string) => {
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(dateStr);
      setSelectedCheckOut(null);
    } else {
      const checkInDate = new Date(selectedCheckIn);
      const checkOutDate = new Date(dateStr);

      if (checkOutDate <= checkInDate) {
        onError('Check-out date must be after check-in date');
        return;
      }

      setSelectedCheckOut(dateStr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCheckIn || !selectedCheckOut) {
      onError('Please select both check-in and check-out dates');
      return;
    }

    // Validate form data
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      onError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    onInfo('Processing your booking...');

    try {
      const booking = await addBooking(formData, selectedCheckIn, selectedCheckOut);
      
      // Validate booking was created successfully
      if (!booking || !booking.id || !booking.total) {
        throw new Error('Booking creation failed - missing required data');
      }
      
      console.log('Booking created successfully:', booking);
      setCurrentBooking(booking);
      
      // Open payment modal
      console.log('Opening payment modal...');
      setIsPaymentModalOpen(true);
      
    } catch (error) {
      console.error('Booking error:', error);
      onError('Failed to process booking. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult: PaymentResult) => {
    if (currentBooking) {
      try {
        await sendBookingNotifications(currentBooking);
        
        // Track successful booking completion
        GoogleAnalytics.trackBookingCompleted(currentBooking.total);
        
        setTimeout(() => {
          onSuccess(
            `Booking confirmed! Your confirmation code is ${currentBooking.confirmationCode}. Payment processed successfully. Check your email for details.`
          );
        }, 1000);

        setTimeout(() => {
          onInfo('Please check your email for booking confirmation and details.');
        }, 3000);

        setTimeout(() => {
          onClose();
                 setFormData({ name: '', email: '', phone: '', guests: 1, checkInTime: '15:00', specialRequests: '' });
          setSelectedCheckIn(null);
          setSelectedCheckOut(null);
          setCurrentBooking(null);
        }, 2000);
      } catch (error) {
        console.error('Email notification error:', error);
        // Still show success message even if emails fail
        setTimeout(() => {
          onSuccess(
            `Booking confirmed! Your confirmation code is ${currentBooking.confirmationCode}. Payment processed successfully.`
          );
        }, 1000);

        setTimeout(() => {
          onInfo('Note: Email notifications may not have been sent. Please contact us if you need confirmation details.');
        }, 3000);

        setTimeout(() => {
          onClose();
                 setFormData({ name: '', email: '', phone: '', guests: 1, checkInTime: '15:00', specialRequests: '' });
          setSelectedCheckIn(null);
          setSelectedCheckOut(null);
          setCurrentBooking(null);
        }, 2000);
      }
    }
  };

  const handlePaymentError = (message: string) => {
    onError(`Payment failed: ${message}`);
  };

  if (!isOpen) return null;

        const today = new Date();

  const nights = selectedCheckIn && selectedCheckOut ? daysBetween(selectedCheckIn, selectedCheckOut) : 0;
  const total = nights > 0 ? calculateTotal(nights) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 animate-scale-in">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Book Your Stay</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span>Select Dates</span>
              </h3>
              <EnhancedCalendar
                blockedDates={blockedDates}
                selectedCheckIn={selectedCheckIn}
                selectedCheckOut={selectedCheckOut}
                onDateSelect={handleDateSelect}
              />
            </div>

            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sticky Booking Summary */}
                <div className="sticky top-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6 backdrop-blur-sm z-10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span>Booking Summary</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Check-in:</span>
                      <span className="text-white font-semibold">
                        {selectedCheckIn ? formatDate(selectedCheckIn) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Check-out:</span>
                      <span className="text-white font-semibold">
                        {selectedCheckOut ? formatDate(selectedCheckOut) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Nights:</span>
                      <span className="text-white font-semibold">{nights}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Check-in Time:</span>
                      <span className="text-white font-semibold flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formData.checkInTime === 'flexible' 
                            ? 'Flexible' 
                            : formData.checkInTime 
                              ? new Date(`2000-01-01T${formData.checkInTime}`).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })
                              : '3:00 PM'
                          }
                        </span>
                      </span>
                    </div>
                    {nights >= 7 && (
                      <div className="flex justify-between items-center text-green-400">
                        <span>Discount (10%):</span>
                        <span className="font-semibold">Applied</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">Total:</span>
                        <span className="text-2xl font-bold text-blue-400">R{total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="+27 12 345 6789"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Number of Guests</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <CheckInTimeSelector
                    selectedTime={formData.checkInTime || '15:00'}
                    onTimeChange={(time) => setFormData({ ...formData, checkInTime: time })}
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Special Requests (Optional)</span>
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                       <button
                         type="submit"
                         disabled={isSubmitting || !selectedCheckIn || !selectedCheckOut}
                         className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                       >
                         <CreditCard className="w-5 h-5" />
                         <span>{isSubmitting ? 'Processing...' : `Proceed to Payment - R${total}`}</span>
                       </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {currentBooking && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={currentBooking.total || total}
          bookingId={currentBooking.id}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
