import { Wifi, Tv, Wind, Car, Waves, Utensils, Shield, Coffee } from 'lucide-react';

const amenities = [
  { icon: Wifi, label: 'High-Speed WiFi', description: 'Fast & reliable internet' },
  { icon: Wind, label: 'Air Conditioning', description: 'Climate controlled' },
  { icon: Tv, label: 'Smart TV', description: 'Netflix & streaming' },
  { icon: Car, label: 'Free Parking', description: 'Secure parking space' },
  { icon: Waves, label: 'Swimming Pool', description: 'Shared pool access' },
  { icon: Utensils, label: 'Full Kitchen', description: 'Modern appliances' },
  { icon: Shield, label: '24/7 Security', description: 'Safe & secure' },
  { icon: Coffee, label: 'Workspace', description: 'Dedicated work area' },
];

export default function Amenities() {
  return (
    <section id="amenities" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Premium Amenities
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need for a comfortable stay
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-center transform transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">{amenity.label}</h3>
                <p className="text-sm text-slate-400">{amenity.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
