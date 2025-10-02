import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Amenities from './components/Amenities';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import PaymentHistoryModal from './components/PaymentHistoryModal';
import Notification from './components/Notification';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  useEffect(() => {
    if (typeof window.emailjs !== 'undefined') {
      window.emailjs.init('33HWU_f44zZmuXLVu');
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.emailjs !== 'undefined') {
        window.emailjs.init('33HWU_f44zZmuXLVu');
      }
    };
    document.body.appendChild(script);

    const timer = setTimeout(() => {
      showNotification(
        "Welcome to Blue Haven on 13th Emperor! Experience luxury living in Johannesburg's most prestigious district.",
        'info',
        6000
      );
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 4000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration + 300);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
         <div className="min-h-screen bg-slate-950">
           <Navbar 
             onBookNowClick={() => setIsBookingModalOpen(true)} 
             onPaymentHistoryClick={() => setIsPaymentHistoryModalOpen(true)}
           />
           <Hero onBookNowClick={() => setIsBookingModalOpen(true)} />
           <Amenities />
           <Gallery />
           <Contact />
           <Footer />

           <BookingModal
             isOpen={isBookingModalOpen}
             onClose={() => setIsBookingModalOpen(false)}
             onSuccess={(msg) => showNotification(msg, 'success', 10000)}
             onError={(msg) => showNotification(msg, 'error', 10000)}
             onInfo={(msg) => showNotification(msg, 'info', 8000)}
           />

           <PaymentHistoryModal
             isOpen={isPaymentHistoryModalOpen}
             onClose={() => setIsPaymentHistoryModalOpen(false)}
           />

           {notifications.map((notification) => (
             <Notification
               key={notification.id}
               message={notification.message}
               type={notification.type}
               onClose={() => removeNotification(notification.id)}
               duration={notification.type === 'success' || notification.type === 'error' ? 10000 : 8000}
             />
           ))}
         </div>
  );
}

export default App;
