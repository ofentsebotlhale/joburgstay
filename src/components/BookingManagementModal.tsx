import { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Phone, CreditCard, Search, Filter, Eye, Edit, Trash2, Clock, Send, Shield } from 'lucide-react';
import { getBookingsByEmail, updateBookingStatus, formatDate } from '../utils/booking';
import { formatCurrency } from '../utils/payment';
import { EmailReminderService } from '../services/emailReminders';
import { AuthService } from '../services/auth';
import type { Booking } from '../types/booking';

interface BookingManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestEmail?: string;
}

export default function BookingManagementModal({ isOpen, onClose, guestEmail }: BookingManagementModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState(guestEmail || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      // Check authentication
      const authenticated = AuthService.isAuthenticated();
      const user = AuthService.getCurrentUser();
      setIsAuthenticated(authenticated);
      setAdminUser(user);

      if (!authenticated) {
        onClose();
        return;
      }

      if (guestEmail) {
        loadBookings(guestEmail);
      }
    }
  }, [isOpen, guestEmail, onClose]);

  const loadBookings = async (email: string) => {
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      const userBookings = await getBookingsByEmail(email);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchEmail.trim()) {
      loadBookings(searchEmail);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Reload bookings to reflect changes
      if (searchEmail.trim()) {
        loadBookings(searchEmail);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleSendReminder = async (bookingId: string, type: 'checkin' | 'checkout') => {
    try {
      setSendingReminder(bookingId);
      await EmailReminderService.sendManualReminder(bookingId, type);
      alert(`${type === 'checkin' ? 'Check-in' : 'Check-out'} reminder sent successfully!`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSendingReminder(null);
    }
  };

  const handleClearAllBookings = () => {
    if (window.confirm('Are you sure you want to delete ALL bookings? This cannot be undone!')) {
      localStorage.removeItem('blueHavenBookings');
      localStorage.removeItem('blueHavenPayments');
      setBookings([]);
      alert('All bookings and payments have been cleared!');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      case 'refunded': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  if (!isOpen || !isAuthenticated) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              <p className="text-sm text-slate-400">Welcome, {adminUser?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Search Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Search Bookings by Email
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Enter guest email address"
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading || !searchEmail.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter and Clear Data */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Bookings</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Clear All Data Button */}
              <button
                onClick={handleClearAllBookings}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No bookings found</p>
              <p className="text-slate-500">Try searching with a different email address</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Booking #{booking.confirmationCode}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CreditCard className="w-4 h-4" />
                          <span>{formatCurrency(booking.total)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status || 'Unknown'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span>Guest Details</span>
                      </h4>
                      <div className="space-y-1 text-sm text-slate-300">
                        <p><strong>Name:</strong> {booking.name}</p>
                        <p className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{booking.email}</span>
                        </p>
                        <p className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{booking.phone}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Booking Details</h4>
                      <div className="space-y-1 text-sm text-slate-300">
                        <p><strong>Nights:</strong> {booking.nights}</p>
                        <p><strong>Total:</strong> {formatCurrency(booking.total)}</p>
                        <p><strong>Created:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                        {booking.specialRequests && (
                          <p><strong>Special Requests:</strong> {booking.specialRequests}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Reminder Buttons */}
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleSendReminder(booking.id, 'checkin')}
                            disabled={sendingReminder === booking.id}
                            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Check-in Reminder</span>
                          </button>
                          <button
                            onClick={() => handleSendReminder(booking.id, 'checkout')}
                            disabled={sendingReminder === booking.id}
                            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Check-out Reminder</span>
                          </button>
                        </>
                      )}
                      
                      {/* Status Update Buttons */}
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
