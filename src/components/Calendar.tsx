import { useEffect, useState } from 'react';

interface CalendarProps {
  month: number;
  year: number;
  blockedDates: string[];
  selectedCheckIn: string | null;
  selectedCheckOut: string | null;
  onDateSelect: (date: string) => void;
}

export default function Calendar({
  month,
  year,
  blockedDates,
  selectedCheckIn,
  selectedCheckOut,
  onDateSelect
}: CalendarProps) {
  const [days, setDays] = useState<number[]>([]);
  const [firstDay, setFirstDay] = useState(0);

  useEffect(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    setFirstDay(firstDayOfMonth);
  }, [month, year]);

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateInRange = (dateStr: string) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const date = new Date(dateStr);
    const checkIn = new Date(selectedCheckIn);
    const checkOut = new Date(selectedCheckOut);
    return date > checkIn && date < checkOut;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">{monthName} {year}</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs text-slate-400 font-semibold py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10"></div>
        ))}

        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const date = new Date(dateStr);
          const isPast = date < today;
          const isBlocked = blockedDates.includes(dateStr);
          const isCheckIn = selectedCheckIn === dateStr;
          const isCheckOut = selectedCheckOut === dateStr;
          const isInRange = isDateInRange(dateStr);

          let buttonClass = 'w-10 h-10 text-sm rounded-lg transition-all duration-200 ';

          if (isPast || isBlocked) {
            buttonClass += 'bg-slate-700/50 text-slate-500 cursor-not-allowed';
          } else if (isCheckIn) {
            buttonClass += 'bg-blue-500 text-white font-bold shadow-lg scale-110';
          } else if (isCheckOut) {
            buttonClass += 'bg-cyan-500 text-white font-bold shadow-lg scale-110';
          } else if (isInRange) {
            buttonClass += 'bg-blue-400/30 text-white';
          } else {
            buttonClass += 'bg-slate-700/30 text-white hover:bg-blue-500 hover:scale-110 cursor-pointer';
          }

          return (
            <button
              key={day}
              onClick={() => !isPast && !isBlocked && onDateSelect(dateStr)}
              disabled={isPast || isBlocked}
              className={buttonClass}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
