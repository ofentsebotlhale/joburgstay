import { Wifi, Tv, Wind, Car, Waves, Utensils, Shield, Coffee } from 'lucide-react';

const amenities = [
  { icon: Wifi, label: 'High-Speed WiFi', description: 'Fast & reliable internet', keywords: 'WiFi, internet, wireless, high-speed' },
  { icon: Wind, label: 'Air Conditioning', description: 'Climate controlled', keywords: 'air conditioning, AC, climate control, temperature' },
  { icon: Tv, label: 'Smart TV', description: 'Netflix & streaming', keywords: 'smart TV, Netflix, streaming, entertainment' },
  { icon: Car, label: 'Free Parking', description: 'Secure parking space', keywords: 'parking, free parking, secure parking, car space' },
  { icon: Waves, label: 'Swimming Pool', description: 'Shared pool access', keywords: 'swimming pool, pool, shared pool, recreation' },
  { icon: Utensils, label: 'Full Kitchen', description: 'Modern appliances', keywords: 'kitchen, full kitchen, appliances, cooking' },
  { icon: Shield, label: '24/7 Security', description: 'Safe & secure', keywords: 'security, 24/7 security, safe, secure' },
  { icon: Coffee, label: 'Workspace', description: 'Dedicated work area', keywords: 'workspace, work area, office space, business' },
];

export default function Amenities() {
  return (
    <section id="amenities" className="py-20 bg-slate-900" itemScope itemType="https://schema.org/LodgingBusiness">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Premium Amenities
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need for a comfortable stay at Blue Haven on 13th Emperor
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6" role="list" aria-label="Property amenities">
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <article
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-center transform transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 group"
                role="listitem"
                itemScope
                itemType="https://schema.org/AmenityFeature"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-white font-semibold mb-1" itemProp="name">{amenity.label}</h3>
                <p className="text-sm text-slate-400" itemProp="description">{amenity.description}</p>
                <meta itemProp="keywords" content={amenity.keywords} />
              </article>
            );
          })}
        </div>

        {/* Additional SEO content */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Why Choose Blue Haven?</h3>
          <div className="grid md:grid-cols-3 gap-8 text-slate-300">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Prime Location</h4>
              <p>Located in Johannesburg's most prestigious district, Blue Haven offers easy access to business districts, shopping centers, and cultural attractions.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Luxury Living</h4>
              <p>Experience the ultimate in comfort with modern amenities, premium finishes, and thoughtful design throughout the property.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Exceptional Service</h4>
              <p>Our dedicated team ensures your stay is perfect with 24/7 support and personalized attention to every detail.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
