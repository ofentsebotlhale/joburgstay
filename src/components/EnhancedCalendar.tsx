import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface EnhancedCalendarProps {
  blockedDates: string[];
  selectedCheckIn: string | null;
  selectedCheckOut: string | null;
  onDateSelect: (date: string) => void;
}

export default function EnhancedCalendar({
  blockedDates,
  selectedCheckIn,
  selectedCheckOut,
  onDateSelect
}: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'single' | 'double' | 'triple'>('double');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePreviousMonth = () => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const isDateInRange = (dateStr: string) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const date = new Date(dateStr);
    const checkIn = new Date(selectedCheckIn);
    const checkOut = new Date(selectedCheckOut);
    return date > checkIn && date < checkOut;
  };

  const renderCalendar = (month: number, year: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    return (
      <div key={`${year}-${month}`} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white">{monthName} {year}</h3>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs text-slate-400 font-semibold py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8"></div>
          ))}

          {days.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const date = new Date(dateStr);
            const isPast = date < today;
            const isBlocked = blockedDates.includes(dateStr);
            const isCheckIn = selectedCheckIn === dateStr;
            const isCheckOut = selectedCheckOut === dateStr;
            const isInRange = isDateInRange(dateStr);

            let buttonClass = 'w-8 h-8 text-xs rounded-lg transition-all duration-200 ';

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
  };

  const getMonthsToShow = () => {
    const months = [];
    const startMonth = currentMonth;
    const startYear = currentYear;

    for (let i = 0; i < (viewMode === 'single' ? 1 : viewMode === 'double' ? 2 : 3); i++) {
      const month = (startMonth + i) % 12;
      const year = startYear + Math.floor((startMonth + i) / 12);
      months.push({ month, year });
    }

    return months;
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation and view controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View mode selector */}
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === 'single' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1 Month
          </button>
          <button
            onClick={() => setViewMode('double')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === 'double' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2 Months
          </button>
          <button
            onClick={() => setViewMode('triple')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === 'triple' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Months
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className={`grid gap-4 ${
        viewMode === 'single' ? 'grid-cols-1' : 
        viewMode === 'double' ? 'grid-cols-1 md:grid-cols-2' : 
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {getMonthsToShow().map(({ month, year }) => renderCalendar(month, year))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-slate-300">Check-in</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-cyan-500 rounded"></div>
          <span className="text-slate-300">Check-out</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400/30 rounded"></div>
          <span className="text-slate-300">Selected range</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-slate-700/50 rounded"></div>
          <span className="text-slate-300">Unavailable</span>
        </div>
      </div>
    </div>
  );
}
