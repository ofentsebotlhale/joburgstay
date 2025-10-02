import { Home, Calendar, MapPin, Phone, CreditCard } from 'lucide-react';

interface NavbarProps {
  onBookNowClick: () => void;
  onPaymentHistoryClick: () => void;
}

export default function Navbar({ onBookNowClick, onPaymentHistoryClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight">Blue Haven</span>
              <span className="text-blue-300 text-xs leading-tight">13th Emperor</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <a href="#amenities" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Amenities</span>
            </a>
            <a href="#gallery" className="text-slate-300 hover:text-white transition-colors duration-200">Gallery</a>
            <a href="#contact" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>Contact</span>
            </a>
          </div>

                 <div className="flex items-center space-x-3">
                   <button
                     onClick={onPaymentHistoryClick}
                     className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-800/50"
                   >
                     <CreditCard className="w-4 h-4" />
                     <span className="hidden sm:inline">Payments</span>
                   </button>
                   <button
                     onClick={onBookNowClick}
                     className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 flex items-center space-x-2"
                   >
                     <Calendar className="w-4 h-4" />
                     <span>Book Now</span>
                   </button>
                 </div>
        </div>
      </div>
    </nav>
  );
}
