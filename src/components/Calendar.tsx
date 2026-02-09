'use client';

import React, { useState, useEffect } from 'react';
import { WorkoutSession } from '@/lib/types';

interface CalendarProps {
  workouts: WorkoutSession[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

export default function Calendar({ workouts, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  
  // Initialize date on client only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const workoutsByDate = new Map<string, WorkoutSession[]>();

  // Index workouts by date
  workouts.forEach((workout) => {
    const key = workout.date;
    if (!workoutsByDate.has(key)) {
      workoutsByDate.set(key, []);
    }
    workoutsByDate.get(key)!.push(workout);
  });

  // Return early if date not initialized
  if (!currentDate) {
    return <div className="bg-white rounded-lg shadow p-6">Loading calendar...</div>;
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [];

  // Add empty cells for days before the month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const formatDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{monthYear}</h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              →
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dateStr = day ? formatDate(day) : null;
            const hasWorkout = dateStr && workoutsByDate.has(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={index}
                onClick={() => dateStr && onDateSelect(dateStr)}
                disabled={!day}
                className={`
                  aspect-square rounded text-sm font-semibold transition-colors
                  ${!day ? 'bg-gray-50 cursor-default' : ''}
                  ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}
                  ${hasWorkout && !isSelected ? 'border-2 border-green-500' : ''}
                  ${hasWorkout && isSelected ? 'ring-2 ring-offset-2 ring-green-500' : ''}
                `}
              >
                {day && (
                  <div>
                    <div>{day}</div>
                    {hasWorkout && <div className="text-xs">●</div>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
