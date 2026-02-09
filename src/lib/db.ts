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
      user_id TEXT NOT NULL,
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
      user_id TEXT NOT NULL,
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

    CREATE TABLE IF NOT EXISTS common_exercises (
      exercise_name TEXT PRIMARY KEY
    );

    CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
    CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON template_exercises(template_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);
    CREATE INDEX IF NOT EXISTS idx_common_exercises_name ON common_exercises(exercise_name);
  `);

  // Seed common exercises if table is empty
  const count = database.prepare('SELECT COUNT(*) as count FROM common_exercises').get() as { count: number };

  if (count.count === 0) {
    seedCommonExercises(database);
  }
}

function seedCommonExercises(database: Database.Database) {
  const commonExercises = [
    // Chest
    'Barbell Bench Press',
    'Incline Barbell Bench Press',
    'Decline Barbell Bench Press',
    'Dumbbell Bench Press',
    'Incline Dumbbell Bench Press',
    'Decline Dumbbell Bench Press',
    'Dumbbell Flyes',
    'Incline Dumbbell Flyes',
    'Cable Flyes',
    'Pec Deck Machine',
    'Push-ups',
    'Chest Dips',

    // Back
    'Deadlift',
    'Barbell Row',
    'Bent Over Row',
    'Dumbbell Row',
    'T-Bar Row',
    'Seated Cable Row',
    'Lat Pulldown',
    'Wide Grip Lat Pulldown',
    'Close Grip Lat Pulldown',
    'Pull-ups',
    'Chin-ups',
    'Face Pulls',
    'Reverse Flyes',
    'Shrugs',
    'Dumbbell Shrugs',
    'Barbell Shrugs',

    // Shoulders
    'Overhead Press',
    'Military Press',
    'Dumbbell Shoulder Press',
    'Arnold Press',
    'Lateral Raise',
    'Dumbbell Lateral Raise',
    'Cable Lateral Raise',
    'Front Raise',
    'Dumbbell Front Raise',
    'Rear Delt Flyes',
    'Reverse Pec Deck',
    'Upright Row',

    // Arms - Biceps
    'Barbell Curl',
    'EZ Bar Curl',
    'Dumbbell Curl',
    'Hammer Curl',
    'Preacher Curl',
    'Concentration Curl',
    'Cable Curl',
    'Incline Dumbbell Curl',
    '21s',

    // Arms - Triceps
    'Tricep Dips',
    'Close Grip Bench Press',
    'Skull Crushers',
    'Overhead Tricep Extension',
    'Dumbbell Tricep Extension',
    'Cable Tricep Pushdown',
    'Rope Pushdown',
    'Tricep Kickback',

    // Legs - Quads
    'Barbell Squat',
    'Back Squat',
    'Front Squat',
    'Leg Press',
    'Leg Extension',
    'Hack Squat',
    'Bulgarian Split Squat',
    'Lunges',
    'Walking Lunges',
    'Goblet Squat',

    // Legs - Hamstrings
    'Romanian Deadlift',
    'Stiff Leg Deadlift',
    'Leg Curl',
    'Lying Leg Curl',
    'Seated Leg Curl',
    'Good Mornings',

    // Legs - Glutes
    'Hip Thrust',
    'Barbell Hip Thrust',
    'Glute Bridge',
    'Cable Kickback',
    'Glute Ham Raise',

    // Legs - Calves
    'Standing Calf Raise',
    'Seated Calf Raise',
    'Calf Press on Leg Press',

    // Core
    'Plank',
    'Side Plank',
    'Crunches',
    'Bicycle Crunches',
    'Russian Twists',
    'Leg Raises',
    'Hanging Leg Raises',
    'Cable Crunches',
    'Ab Wheel Rollout',
    'Mountain Climbers',

    // Olympic Lifts
    'Clean and Jerk',
    'Snatch',
    'Power Clean',
    'Hang Clean',

    // Functional
    'Farmer\'s Walk',
    'Sled Push',
    'Sled Pull',
    'Battle Ropes',
    'Box Jumps',
    'Burpees',
    'Kettlebell Swing',
  ];

  const insert = database.prepare('INSERT OR IGNORE INTO common_exercises (exercise_name) VALUES (?)');

  commonExercises.forEach(exercise => {
    insert.run(exercise);
  });

  console.log(`Seeded ${commonExercises.length} common exercises!`);
}

export default getDatabase;
