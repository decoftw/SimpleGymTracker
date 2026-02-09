import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Exercise } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      // Return empty array if no query
      return NextResponse.json([]);
    }

    // Search in both common exercises and user's logged exercises
    const commonExercises = db
      .prepare('SELECT exercise_name FROM common_exercises WHERE LOWER(exercise_name) LIKE LOWER(?) ORDER BY exercise_name ASC')
      .all(`%${query}%`) as Array<{ exercise_name: string }>;

    const userExercises = db
      .prepare('SELECT DISTINCT exercise_name FROM exercises WHERE LOWER(exercise_name) LIKE LOWER(?) ORDER BY exercise_name ASC')
      .all(`%${query}%`) as Array<{ exercise_name: string }>;

    // Combine and deduplicate results
    const allExercises = new Set<string>();

    // Add user exercises first (prioritize their own history)
    userExercises.forEach(e => allExercises.add(e.exercise_name));

    // Add common exercises
    commonExercises.forEach(e => allExercises.add(e.exercise_name));

    // Convert to array, limit to 50 results
    const results = Array.from(allExercises).slice(0, 50);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching exercises:', error);
    return NextResponse.json({ error: 'Failed to search exercises' }, { status: 500 });
  }
}
