'use client';

import React, { useState } from 'react';
import ExerciseForm, { ExerciseFormData } from './ExerciseForm';
import { Template, TemplateExercise } from '@/lib/types';

interface WorkoutFormProps {
  onSave: (
    title: string,
    date: string,
    exercises: ExerciseFormData[]
  ) => Promise<void>;
  templates: Template[];
  onTemplateSave: (workoutTitle: string, exercises: ExerciseFormData[]) => Promise<void>;
}

export default function WorkoutForm({ onSave, templates, onTemplateSave }: WorkoutFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddExercise = (exercise: ExerciseFormData) => {
    setExercises([...exercises, exercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Workout title is required');
      return;
    }
    if (exercises.length === 0) {
      alert('Add at least one exercise');
      return;
    }

    try {
      setIsLoading(true);
      await onSave(title, date, exercises);
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!title.trim()) {
      alert('Workout title is required to save as template');
      return;
    }
    if (exercises.length === 0) {
      alert('Add at least one exercise to save as template');
      return;
    }

    const templateName = prompt('Template name:', title);
    if (templateName) {
      try {
        setIsLoading(true);
        await onTemplateSave(templateName, exercises);
        alert('Template saved!');
      } catch (error) {
        console.error('Error saving template:', error);
        alert('Failed to save template');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUseTemplate = (template: Template) => {
    setTitle(template.name);
    if (template.exercises) {
      const templateExercises = template.exercises.map((te: TemplateExercise) => ({
        exercise_name: te.exercise_name,
        weight: 0,
        sets: te.sets,
        reps: te.reps,
      }));
      setExercises(templateExercises);
    }
    setShowTemplates(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="bg-blue-50 rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">New Workout</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Workout Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chest Day, Full Body..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
          >
            Load Template
          </button>
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            disabled={exercises.length === 0 || isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50"
          >
            Save as Template
          </button>
        </div>

        {showTemplates && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-3">Available Templates</h3>
            {templates.length === 0 ? (
              <p className="text-gray-500 text-sm">No templates saved yet</p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleUseTemplate(template)}
                    className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    <div className="font-semibold">{template.name}</div>
                    <div className="text-sm text-gray-600">
                      {template.exercises?.length || 0} exercises
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ExerciseForm onSubmit={handleAddExercise} />

      {exercises.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Exercises ({exercises.length})</h3>
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
              >
                <div>
                  <div className="font-semibold">{exercise.exercise_name}</div>
                  <div className="text-sm text-gray-600">
                    {exercise.weight} lbs × {exercise.sets} × {exercise.reps}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(index)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={exercises.length === 0 || isLoading}
        className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Workout'}
      </button>
    </form>
  );
}
