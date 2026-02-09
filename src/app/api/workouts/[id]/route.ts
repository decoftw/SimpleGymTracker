import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { WorkoutSession, Exercise } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const workout = db
      .prepare('SELECT * FROM workout_sessions WHERE id = ?')
      .get(id) as WorkoutSession | undefined;

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    const exercises = db
      .prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index ASC')
      .all(id) as Exercise[];

    return NextResponse.json({ ...workout, exercises });
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const body = await request.json();
    const { title, date, exercises } = body;

    // Check if workout exists
    const workout = db
      .prepare('SELECT * FROM workout_sessions WHERE id = ?')
      .get(id) as WorkoutSession | undefined;

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Update workout
    if (title) {
      db.prepare('UPDATE workout_sessions SET title = ? WHERE id = ?').run(title, id);
    }
    if (date) {
      db.prepare('UPDATE workout_sessions SET date = ? WHERE id = ?').run(date, id);
    }

    // Update exercises if provided
    if (exercises && Array.isArray(exercises)) {
      // Delete existing exercises
      db.prepare('DELETE FROM exercises WHERE workout_id = ?').run(id);

      // Insert new exercises
      const insertExercise = db.prepare(
        'INSERT INTO exercises (id, workout_id, exercise_name, weight, sets, reps, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      const now = new Date().toISOString();
      exercises.forEach((exercise: any, index: number) => {
        insertExercise.run(
          uuidv4(),
          id,
          exercise.exercise_name,
          exercise.weight,
          exercise.sets,
          exercise.reps,
          index,
          now
        );
      });
    }

    const updatedWorkout = db
      .prepare('SELECT * FROM workout_sessions WHERE id = ?')
      .get(id) as WorkoutSession;

    const updatedExercises = db
      .prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index ASC')
      .all(id) as Exercise[];

    return NextResponse.json({ ...updatedWorkout, exercises: updatedExercises });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    // Check if workout exists
    const workout = db
      .prepare('SELECT * FROM workout_sessions WHERE id = ?')
      .get(id) as WorkoutSession | undefined;

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Delete exercises first (cascade handled by FK but explicit for clarity)
    db.prepare('DELETE FROM exercises WHERE workout_id = ?').run(id);

    // Delete workout
    db.prepare('DELETE FROM workout_sessions WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
