import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { WorkoutSession, Exercise } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = 'SELECT * FROM workout_sessions';
    let params: any[] = [];

    if (date) {
      query += ' WHERE date = ?';
      params.push(date);
    }

    query += ' ORDER BY created_at DESC';

    const workouts = db.prepare(query).all(...params) as WorkoutSession[];

    // Add exercises to each workout
    const workoutsWithExercises = workouts.map((workout) => {
      const exercises = db
        .prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index ASC')
        .all(workout.id) as Exercise[];
      return { ...workout, exercises };
    });

    return NextResponse.json(workoutsWithExercises);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();
    const body = await request.json();
    const { title, date, exercises } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Insert workout session
    db.prepare(
      'INSERT INTO workout_sessions (id, title, date, created_at) VALUES (?, ?, ?, ?)'
    ).run(id, title, date, now);

    // Insert exercises
    if (exercises && Array.isArray(exercises)) {
      const insertExercise = db.prepare(
        'INSERT INTO exercises (id, workout_id, exercise_name, weight, sets, reps, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

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

    const workout = {
      id,
      title,
      date,
      created_at: now,
      exercises: exercises || [],
    };

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}
