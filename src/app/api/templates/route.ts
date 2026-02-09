import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Template, TemplateExercise, CreateTemplateExercise } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const db = getDatabase();

    const templates = db
      .prepare('SELECT * FROM templates WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as Template[];

    // Add exercises to each template
    const templatesWithExercises = templates.map((template) => {
      const exercises = db
        .prepare('SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index ASC')
        .all(template.id) as TemplateExercise[];
      return { ...template, exercises };
    });

    return NextResponse.json(templatesWithExercises);
  } catch (error) {
    console.error('Error fetching templates:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const db = getDatabase();
    const body = await request.json();
    const { name, exercises } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Template name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (exercises !== undefined && !Array.isArray(exercises)) {
      return NextResponse.json({ error: 'Exercises must be an array' }, { status: 400 });
    }

    if (exercises) {
      for (const exercise of exercises) {
        if (!exercise.exercise_name || typeof exercise.exercise_name !== 'string' ||
            typeof exercise.sets !== 'number' || exercise.sets <= 0 ||
            typeof exercise.reps !== 'number' || exercise.reps <= 0) {
          return NextResponse.json({ error: 'Invalid exercise data' }, { status: 400 });
        }
      }
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Insert template
    db.prepare(
      'INSERT INTO templates (id, user_id, name, created_at) VALUES (?, ?, ?, ?)'
    ).run(id, userId, name, now);

    // Insert template exercises
    if (exercises && Array.isArray(exercises)) {
      const insertExercise = db.prepare(
        'INSERT INTO template_exercises (id, template_id, exercise_name, sets, reps, order_index) VALUES (?, ?, ?, ?, ?, ?)'
      );

      exercises.forEach((exercise: CreateTemplateExercise, index: number) => {
        insertExercise.run(
          uuidv4(),
          id,
          exercise.exercise_name,
          exercise.sets,
          exercise.reps,
          index
        );
      });
    }

    const template = {
      id,
      user_id: userId,
      name,
      created_at: now,
      exercises: exercises || [],
    };

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
