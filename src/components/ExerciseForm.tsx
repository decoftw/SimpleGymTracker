'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface ExerciseFormData {
  exercise_name: string;
  weight: number;
  sets: number;
  reps: number;
}

interface ExerciseFormProps {
  onSubmit: (exercise: ExerciseFormData) => void;
  initialData?: ExerciseFormData;
  onCancel?: () => void;
}

export default function ExerciseForm({ onSubmit, initialData, onCancel }: ExerciseFormProps) {
  const [exercise_name, setExerciseName] = useState(initialData?.exercise_name || '');
  const [weight, setWeight] = useState(initialData?.weight || 0);
  const [sets, setSets] = useState(initialData?.sets || 3);
  const [reps, setReps] = useState(initialData?.reps || 8);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleButtonClick = () => {
    if (!exercise_name.trim()) {
      alert('Exercise name is required');
      return;
    }
    onSubmit({
      exercise_name,
      weight: Number(weight),
      sets: Number(sets),
      reps: Number(reps),
    });
    setExerciseName('');
    setWeight(0);
    setSets(3);
    setReps(8);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = useCallback((name: string) => {
    setExerciseName(name);
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  const handleExerciseChange = useCallback((value: string) => {
    setExerciseName(value);

    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setShowSuggestions(true);
      setIsSearching(true);

      fetch(`/api/exercises/search?q=${encodeURIComponent(value)}`)
        .then((response) => response.json())
        .then((results) => {
          setSuggestions(results);
        })
        .catch((error) => {
          console.error('Search error:', error);
          setSuggestions([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Exercise Name</label>
          <div className="relative">
            <input
              type="text"
              value={exercise_name}
              onChange={(e) => handleExerciseChange(e.target.value)}
              onFocus={() => exercise_name && setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Bench Press, Lateral Raise..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg z-10 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sets</label>
            <input
              type="number"
              min="1"
              value={sets}
              onChange={(e) => setSets(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reps</label>
            <input
              type="number"
              min="1"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleButtonClick}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              +Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
