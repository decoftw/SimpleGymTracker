import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Template, TemplateExercise } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();

    const templates = db
      .prepare('SELECT * FROM templates ORDER BY created_at DESC')
      .all() as Template[];

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
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();
    const body = await request.json();
    const { name, exercises } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Insert template
    db.prepare(
      'INSERT INTO templates (id, name, created_at) VALUES (?, ?, ?)'
    ).run(id, name, now);

    // Insert template exercises
    if (exercises && Array.isArray(exercises)) {
      const insertExercise = db.prepare(
        'INSERT INTO template_exercises (id, template_id, exercise_name, sets, reps, order_index) VALUES (?, ?, ?, ?, ?, ?)'
      );

      exercises.forEach((exercise: any, index: number) => {
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
      name,
      created_at: now,
      exercises: exercises || [],
    };

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
