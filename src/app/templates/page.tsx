'use client';

import React, { useState, useEffect } from 'react';
import { Template } from '@/lib/types';
import Link from 'next/link';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete template');
        }

        await fetchTemplates();
        alert('Template deleted!');
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Workout Templates</h1>
        <p className="text-gray-600">
          Manage your saved workout templates to quickly start new sessions.
        </p>
      </div>

      <Link href="/" className="inline-block mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold">
        ← Back to Dashboard
      </Link>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No templates saved yet.</p>
          <p className="text-gray-600 text-sm">
            Create a workout and save it as a template from the dashboard to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">{template.name}</h3>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  {template.exercises?.length || 0} exercises
                </p>
                {template.exercises && template.exercises.length > 0 && (
                  <div className="space-y-2">
                    {template.exercises.map((exercise, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-medium">{exercise.exercise_name}</div>
                        <div className="text-gray-600">
                          {exercise.sets} × {exercise.reps}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Created {new Date(template.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
