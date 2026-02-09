'use client';

import React, { useState } from 'react';
import { WorkoutSession } from '@/lib/types';

interface WorkoutDetailProps {
  workouts: WorkoutSession[];
  selectedDate: string | null;
  onDelete: (workoutId: string) => Promise<void>;
}

export default function WorkoutDetail({ workouts, selectedDate, onDelete }: WorkoutDetailProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Select a date to view workouts
      </div>
    );
  }

  const date = new Date(selectedDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">{formattedDate}</h3>
        <p className="text-gray-500">No workouts logged for this day</p>
      </div>
    );
  }

  const handleDelete = async (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      try {
        setDeletingId(workoutId);
        await onDelete(workoutId);
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{formattedDate}</h3>

      <div className="space-y-6">
        {workouts.map((workout) => (
          <div key={workout.id} className="border-l-4 border-blue-500 pl-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold">{workout.title}</h4>
              <button
                onClick={() => handleDelete(workout.id)}
                disabled={deletingId === workout.id}
                className="text-red-500 hover:text-red-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === workout.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>

            {workout.exercises && workout.exercises.length > 0 && (
              <div className="space-y-2 mt-3">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">{exercise.exercise_name}</div>
                    <div className="text-sm text-gray-600">
                      {exercise.weight} lbs · {exercise.sets} × {exercise.reps}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-3">
              {new Date(workout.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
