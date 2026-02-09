import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Exercise } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    let sql = 'SELECT DISTINCT exercise_name FROM exercises';
    const params: any[] = [];

    if (query) {
      sql += ' WHERE LOWER(exercise_name) LIKE LOWER(?)';
      params.push(`%${query}%`);
    }

    sql += ' ORDER BY exercise_name ASC LIMIT 50';

    const exercises = db.prepare(sql).all(...params) as Array<{ exercise_name: string }>;

    return NextResponse.json(
      exercises.map((e) => e.exercise_name)
    );
  } catch (error) {
    console.error('Error searching exercises:', error);
    return NextResponse.json({ error: 'Failed to search exercises' }, { status: 500 });
  }
}
