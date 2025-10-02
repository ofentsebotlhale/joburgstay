import { Home, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Home className="w-6 h-6 text-blue-400" />
            <span className="text-white font-bold">Blue Haven on 13th Emperor</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>in Johannesburg</span>
          </div>

          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
