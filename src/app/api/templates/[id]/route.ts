import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Template, TemplateExercise, CreateTemplateExercise } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    const db = getDatabase();

    const template = db
      .prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?')
      .get(id, userId) as Template | undefined;

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const exercises = db
      .prepare('SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index ASC')
      .all(id) as TemplateExercise[];

    return NextResponse.json({ ...template, exercises });
  } catch (error) {
    console.error('Error fetching template:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    const db = getDatabase();
    const body = await request.json();
    const { name, exercises } = body;

    // Validate name
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    // Validate exercises
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

    // Check if template exists and belongs to user
    const template = db
      .prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?')
      .get(id, userId) as Template | undefined;

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Update template name
    if (name) {
      db.prepare('UPDATE templates SET name = ? WHERE id = ?').run(name, id);
    }

    // Update exercises if provided
    if (exercises && Array.isArray(exercises)) {
      // Delete existing exercises
      db.prepare('DELETE FROM template_exercises WHERE template_id = ?').run(id);

      // Insert new exercises
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

    const updatedTemplate = db
      .prepare('SELECT * FROM templates WHERE id = ?')
      .get(id) as Template;

    const updatedExercises = db
      .prepare('SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index ASC')
      .all(id) as TemplateExercise[];

    return NextResponse.json({ ...updatedTemplate, exercises: updatedExercises });
  } catch (error) {
    console.error('Error updating template:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    const db = getDatabase();

    // Check if template exists and belongs to user
    const template = db
      .prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?')
      .get(id, userId) as Template | undefined;

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Delete template exercises
    db.prepare('DELETE FROM template_exercises WHERE template_id = ?').run(id);

    // Delete template
    db.prepare('DELETE FROM templates WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
