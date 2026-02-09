'use client';

import React, { useState, useEffect } from 'react';

interface SearchExercisesProps {
  onSearch: (results: string[]) => void;
  placeholder?: string;
}

export default function SearchExercises({
  onSearch,
  placeholder = 'Search exercises...',
}: SearchExercisesProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim(), '') {
        try {
          const response = await fetch(`/api/exercises/search?q=${encodeURIComponent(query)}`);
          const results = await response.json();
          onSearch(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        onSearch([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
