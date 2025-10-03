import { Clock } from 'lucide-react';

interface CheckInTimeSelectorProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

const CHECK_IN_TIMES = [
  { value: '14:00', label: '2:00 PM', description: 'Standard check-in' },
  { value: '15:00', label: '3:00 PM', description: 'Afternoon arrival' },
  { value: '16:00', label: '4:00 PM', description: 'Late afternoon' },
  { value: '17:00', label: '5:00 PM', description: 'Evening arrival' },
  { value: '18:00', label: '6:00 PM', description: 'Late evening' },
  { value: '19:00', label: '7:00 PM', description: 'Night arrival' },
  { value: '20:00', label: '8:00 PM', description: 'Late night' },
  { value: 'flexible', label: 'Flexible', description: 'I\'ll coordinate with host' },
];

export default function CheckInTimeSelector({ selectedTime, onTimeChange }: CheckInTimeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Preferred Check-in Time</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CHECK_IN_TIMES.map((time) => (
          <button
            key={time.value}
            onClick={() => onTimeChange(time.value)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedTime === time.value
                ? 'border-blue-500 bg-blue-500/20 text-white'
                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-blue-400 hover:bg-slate-700/50'
            }`}
          >
            <div className="font-semibold text-sm">{time.label}</div>
            <div className="text-xs text-slate-400 mt-1">{time.description}</div>
          </button>
        ))}
      </div>
      
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-2">Check-in Information</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Check-in is available from 2:00 PM onwards</li>
          <li>• Early check-in may be available upon request</li>
          <li>• Late check-in (after 8:00 PM) requires prior arrangement</li>
          <li>• You'll receive detailed check-in instructions via email</li>
        </ul>
      </div>
    </div>
  );
}
