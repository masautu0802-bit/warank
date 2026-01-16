'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface DateSliderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateSlider({ selectedDate, onDateChange }: DateSliderProps) {
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    // 今日から30日後までの日付を生成
    const dateArray: string[] = [];
    const today = new Date();
    for (let i = -7; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dateArray.push(date.toISOString().split('T')[0]);
    }
    setDates(dateArray);
  }, []);

  return (
    <div className="mb-6 sm:mb-8">
      <label className="block text-xs sm:text-sm font-medium mb-2">日付を選択</label>
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {dates.map((date) => {
          const dateObj = new Date(date);
          const isToday = date === new Date().toISOString().split('T')[0];
          const isSelected = date === selectedDate;

          return (
            <Button
              key={date}
              onClick={() => onDateChange(date)}
              variant={isSelected ? 'default' : isToday ? 'outline' : 'ghost'}
              size="sm"
              className="whitespace-nowrap text-xs sm:text-sm min-w-[3rem] sm:min-w-[3.5rem] touch-manipulation"
            >
              {dateObj.getMonth() + 1}/{dateObj.getDate()}
              {isToday && <span className="hidden sm:inline"> (今日)</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
