'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import WorkoutForm from '@/components/WorkoutForm';
import WorkoutDetail from '@/components/WorkoutDetail';
import { WorkoutSession, Template } from '@/lib/types';
import { ExerciseFormData } from '@/components/ExerciseForm';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // Fetch all workouts and templates on mount
  useEffect(() => {
    if (user) {
      fetchWorkouts();
      fetchTemplates();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSaveWorkout = async (
    title: string,
    date: string,
    exercises: ExerciseFormData[]
  ) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          date,
          exercises,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save workout');
      }

      await fetchWorkouts();
      alert('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTemplate = async (
    templateName: string,
    exercises: ExerciseFormData[]
  ) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          exercises,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      await fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      await fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedDateWorkouts = selectedDate
    ? workouts.filter((w) => w.date === selectedDate)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column: Calendar and Workout Detail */}
      <div className="lg:col-span-1 space-y-6">
        <Calendar
          workouts={workouts}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
        <WorkoutDetail
          workouts={selectedDateWorkouts}
          selectedDate={selectedDate}
          onDelete={handleDeleteWorkout}
        />
      </div>

      {/* Right column: Workout Form */}
      <div className="lg:col-span-2">
        <WorkoutForm
          onSave={handleSaveWorkout}
          templates={templates}
          onTemplateSave={handleSaveTemplate}
        />
      </div>
    </div>
  );
}
