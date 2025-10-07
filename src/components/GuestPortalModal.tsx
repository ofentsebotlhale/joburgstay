import { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, CreditCard, Star, MessageSquare, LogOut, Settings, Home, Plus } from 'lucide-react';
import GuestAuthService from '../services/guestAuth';
import ReviewModal from './ReviewModal';
import type { Guest, GuestLoginData, GuestPortalStats, Review } from '../types/guest';
import type { Booking } from '../types/booking';

interface GuestPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (guest: Guest) => void;
}

export default function GuestPortalModal({ isOpen, onClose, onLoginSuccess }: GuestPortalModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [stats, setStats] = useState<GuestPortalStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'reviews' | 'profile'>('overview');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<string | null>(null);
  const [loginData, setLoginData] = useState<GuestLoginData>({
    email: '',
    bookingId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    const authenticated = GuestAuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const guest = GuestAuthService.getCurrentGuest();
      setCurrentGuest(guest);
      
      if (guest) {
        await loadGuestData(guest.id);
      }
    }
  };

  const loadGuestData = async (guestId: string) => {
    try {
      setIsLoading(true);
      
      // Load stats
      const guestStats = await GuestAuthService.getGuestStats(guestId);
      setStats(guestStats);
      
      // Load bookings
      const guestBookings = await loadGuestBookings();
      setBookings(guestBookings);
      
      // Load reviews
      const guestReviews = await loadGuestReviews();
      setReviews(guestReviews);
      
    } catch (error) {
      console.error('Error loading guest data:', error);
      setError('Failed to load guest data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuestBookings = async (): Promise<Booking[]> => {
    try {
      // Load from localStorage
      const localBookings = localStorage.getItem('bookings');
      const allBookings = localBookings ? JSON.parse(localBookings) : [];
      
      // Filter bookings for current guest
      const guestBookings = allBookings.filter((booking: Booking) => 
        booking.email === currentGuest?.email
      );
      
      return guestBookings.sort((a: Booking, b: Booking) => 
        new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
      );
    } catch (error) {
      console.error('Error loading bookings:', error);
      return [];
    }
  };

  const loadGuestReviews = async (): Promise<Review[]> => {
    try {
      // Load from localStorage
      const localReviews = localStorage.getItem('reviews');
      const allReviews = localReviews ? JSON.parse(localReviews) : [];
      
      // Filter reviews for current guest
      const guestReviews = allReviews.filter((review: Review) => 
        review.guestId === currentGuest?.id
      );
      
      return guestReviews.sort((a: Review, b: Review) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error loading reviews:', error);
      return [];
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const guest = await GuestAuthService.login(loginData);
      setCurrentGuest(guest);
      setIsAuthenticated(true);
      setIsLoginMode(false);
      
      await loadGuestData(guest.id);
      
      if (onLoginSuccess) {
        onLoginSuccess(guest);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    GuestAuthService.logout();
    setIsAuthenticated(false);
    setCurrentGuest(null);
    setStats(null);
    setBookings([]);
    setReviews([]);
    setIsLoginMode(true);
    setActiveTab('overview');
  };

  const handleReviewSubmit = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'isVerified' | 'helpful'>) => {
    try {
      const newReview: Review = {
        ...reviewData,
        id: 'REVIEW_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        createdAt: new Date().toISOString(),
        isVerified: true,
        helpful: 0
      };

      // Save to localStorage
      const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      existingReviews.push(newReview);
      localStorage.setItem('reviews', JSON.stringify(existingReviews));

      // Update local state
      setReviews(prev => [newReview, ...prev]);

      // Save to Supabase if available
      if (typeof window !== 'undefined' && window.supabase) {
        await window.supabase
          .from('reviews')
          .insert([{
            id: newReview.id,
            guest_id: newReview.guestId,
            booking_id: newReview.bookingId,
            rating: newReview.rating,
            title: newReview.title,
            comment: newReview.comment,
            created_at: newReview.createdAt,
            is_verified: newReview.isVerified,
            helpful: newReview.helpful
          }]);
      }

      setIsReviewModalOpen(false);
      setSelectedBookingForReview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const openReviewModal = (bookingId: string) => {
    setSelectedBookingForReview(bookingId);
    setIsReviewModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              {isAuthenticated ? 'Guest Portal' : 'Guest Login'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!isAuthenticated ? (
            /* Login Form */
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Welcome Back!</h3>
                <p className="text-slate-400">Access your bookings and manage your stay</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Booking Reference (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={loginData.bookingId}
                    onChange={(e) => setLoginData({ ...loginData, bookingId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="BHM123456789"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your booking ID if this is your first time logging in
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <User className="w-5 h-5" />
                  <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-slate-400 text-sm">
                  Don't have an account? We'll create one for you automatically.
                </p>
              </div>
            </div>
          ) : (
            /* Guest Portal Dashboard */
            <div>
              {/* Welcome Section */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Welcome back, {currentGuest?.name || 'Guest'}!
                    </h3>
                    <p className="text-slate-400">{currentGuest?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-slate-800 rounded-full"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-400">Total Bookings</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-slate-400">Upcoming</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.upcomingBookings}</p>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-slate-400">Total Spent</span>
                    </div>
                    <p className="text-lg font-bold text-white">{formatCurrency(stats.totalSpent)}</p>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-slate-400">Reviews</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.reviewsGiven}</p>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex space-x-1 mb-6 bg-slate-800/50 border border-slate-700 rounded-xl p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'bookings', label: 'Bookings', icon: Calendar },
                  { id: 'reviews', label: 'Reviews', icon: Star },
                  { id: 'profile', label: 'Profile', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-400">#{booking.id}</span>
                              <span className="text-sm text-slate-400">{formatDate(booking.checkIn)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                              <span className="text-green-400 font-semibold">{formatCurrency(booking.total || 0)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No bookings found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">All Bookings</h3>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-semibold text-blue-400">#{booking.id}</span>
                              <span className="text-lg font-bold text-green-400">{formatCurrency(booking.total || 0)}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <span className="text-sm text-slate-400">Check-in:</span>
                                <p className="text-white">{formatDate(booking.checkIn)}</p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-400">Check-out:</span>
                                <p className="text-white">{formatDate(booking.checkOut)}</p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-400">Guests:</span>
                                <p className="text-white">{booking.guests}</p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-400">Status:</span>
                                <p className="text-white capitalize">{booking.status || 'confirmed'}</p>
                              </div>
                            </div>
                            {booking.specialRequests && (
                              <div>
                                <span className="text-sm text-slate-400">Special Requests:</span>
                                <p className="text-white">{booking.specialRequests}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No bookings found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Reviews & Ratings</h3>
                      <button
                        onClick={() => openReviewModal('')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Write Review</span>
                      </button>
                    </div>
                    
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-slate-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-slate-400">{formatDate(review.createdAt)}</span>
                              </div>
                              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                Verified Stay
                              </span>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">{review.title}</h4>
                            <p className="text-slate-300">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">No reviews yet</p>
                        <button
                          onClick={() => openReviewModal('')}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 flex items-center space-x-2 mx-auto"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Write Your First Review</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400">Name</label>
                          <p className="text-white">{currentGuest?.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Email</label>
                          <p className="text-white">{currentGuest?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Phone</label>
                          <p className="text-white">{currentGuest?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Member Since</label>
                          <p className="text-white">{currentGuest?.createdAt ? formatDate(currentGuest.createdAt) : 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && currentGuest && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedBookingForReview(null);
          }}
          bookingId={selectedBookingForReview || ''}
          guestId={currentGuest.id}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
