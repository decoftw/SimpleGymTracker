import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'gym-tracker.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: Database.Database) {
  // Create tables if they don't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      workout_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      weight REAL NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS template_exercises (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
    CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON template_exercises(template_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);
  `);
}

export default getDatabase;
