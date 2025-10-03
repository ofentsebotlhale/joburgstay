import { MapPin, Star, Users } from 'lucide-react';

interface HeroProps {
  onBookNowClick: () => void;
}

export default function Hero({ onBookNowClick }: HeroProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* SEO-optimized heading structure */}
        <header className="mb-8">
          <div className="flex items-center justify-center space-x-1 mb-4 animate-fade-in">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" aria-label={`5-star rating`} />
            ))}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up">
            Blue Haven on 13th Emperor
          </h1>

          <h2 className="text-xl md:text-2xl text-blue-200 mb-4 animate-slide-up animation-delay-200">
            Luxury Living in Johannesburg's Premier District
          </h2>
        </header>

        {/* Key features with semantic markup */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-slate-300 animate-slide-up animation-delay-400">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-400" aria-hidden="true" />
            <span>Johannesburg, South Africa</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" aria-hidden="true" />
            <span>Up to 6 Guests</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">R500</span>
            <span className="text-slate-400">/ night</span>
          </div>
        </div>

        {/* Call-to-action */}
        <div className="animate-slide-up animation-delay-600">
          <button
            onClick={onBookNowClick}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50"
            aria-label="Book your stay at Blue Haven on 13th Emperor"
          >
            Book Your Stay Now
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-400 animate-slide-up animation-delay-800">
          10% discount for stays of 7+ nights
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
