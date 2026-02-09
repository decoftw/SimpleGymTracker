-- Supabase PostgreSQL Schema with RLS (Row Level Security)

-- Users table (managed by Supabase Auth, extending with profile data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workouts table - user_id isolates data
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exercises table - linked to workouts and user
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight REAL NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates table - user owns their templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Template exercises table - linked to user's templates
CREATE TABLE IF NOT EXISTS template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Common exercises (shared by all users, no RLS needed)
CREATE TABLE IF NOT EXISTS common_exercises (
  exercise_name TEXT PRIMARY KEY
);

-- INDEXES for performance
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(date);
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_template_exercises_user_id ON template_exercises(user_id);
CREATE INDEX idx_template_exercises_template_id ON template_exercises(template_id);
CREATE INDEX idx_common_exercises_name ON common_exercises(exercise_name);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only see/edit their own
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workout Sessions: Users can only see/edit their own
CREATE POLICY "Users can view own workouts"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create workouts"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Exercises: Users can only see/edit their own
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);

-- Templates: Users can only see/edit their own
CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);

-- Template Exercises: Users can only see/edit their own
CREATE POLICY "Users can view own template exercises"
  ON template_exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create template exercises"
  ON template_exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own template exercises"
  ON template_exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own template exercises"
  ON template_exercises FOR DELETE
  USING (auth.uid() = user_id);

-- Common Exercises: Everyone can view (no INSERT/UPDATE/DELETE)
ALTER TABLE common_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view common exercises"
  ON common_exercises FOR SELECT
  TO authenticated
  USING (true);

-- SEED COMMON EXERCISES
INSERT INTO common_exercises (exercise_name) VALUES
-- Chest
('Barbell Bench Press'),
('Incline Barbell Bench Press'),
('Decline Barbell Bench Press'),
('Dumbbell Bench Press'),
('Incline Dumbbell Bench Press'),
('Decline Dumbbell Bench Press'),
('Dumbbell Flyes'),
('Incline Dumbbell Flyes'),
('Cable Flyes'),
('Pec Deck Machine'),
('Push-ups'),
('Chest Dips'),
-- Back
('Deadlift'),
('Barbell Row'),
('Bent Over Row'),
('Dumbbell Row'),
('T-Bar Row'),
('Seated Cable Row'),
('Lat Pulldown'),
('Wide Grip Lat Pulldown'),
('Close Grip Lat Pulldown'),
('Pull-ups'),
('Chin-ups'),
('Face Pulls'),
('Reverse Flyes'),
('Shrugs'),
('Dumbbell Shrugs'),
('Barbell Shrugs'),
-- Shoulders
('Overhead Press'),
('Military Press'),
('Dumbbell Shoulder Press'),
('Arnold Press'),
('Lateral Raise'),
('Dumbbell Lateral Raise'),
('Cable Lateral Raise'),
('Front Raise'),
('Dumbbell Front Raise'),
('Rear Delt Flyes'),
('Reverse Pec Deck'),
('Upright Row'),
-- Arms - Biceps
('Barbell Curl'),
('EZ Bar Curl'),
('Dumbbell Curl'),
('Hammer Curl'),
('Preacher Curl'),
('Concentration Curl'),
('Cable Curl'),
('Incline Dumbbell Curl'),
('21s'),
-- Arms - Triceps
('Tricep Dips'),
('Close Grip Bench Press'),
('Skull Crushers'),
('Overhead Tricep Extension'),
('Dumbbell Tricep Extension'),
('Cable Tricep Pushdown'),
('Rope Pushdown'),
('Tricep Kickback'),
-- Legs - Quads
('Barbell Squat'),
('Back Squat'),
('Front Squat'),
('Leg Press'),
('Leg Extension'),
('Hack Squat'),
('Bulgarian Split Squat'),
('Lunges'),
('Walking Lunges'),
('Goblet Squat'),
-- Legs - Hamstrings
('Romanian Deadlift'),
('Stiff Leg Deadlift'),
('Leg Curl'),
('Lying Leg Curl'),
('Seated Leg Curl'),
('Good Mornings'),
-- Legs - Glutes
('Hip Thrust'),
('Barbell Hip Thrust'),
('Glute Bridge'),
('Cable Kickback'),
('Glute Ham Raise'),
-- Legs - Calves
('Standing Calf Raise'),
('Seated Calf Raise'),
('Calf Press on Leg Press'),
-- Core
('Plank'),
('Side Plank'),
('Crunches'),
('Bicycle Crunches'),
('Russian Twists'),
('Leg Raises'),
('Hanging Leg Raises'),
('Cable Crunches'),
('Ab Wheel Rollout'),
('Mountain Climbers'),
-- Olympic Lifts
('Clean and Jerk'),
('Snatch'),
('Power Clean'),
('Hang Clean'),
-- Functional
('Farmer''s Walk'),
('Sled Push'),
('Sled Pull'),
('Battle Ropes'),
('Box Jumps'),
('Burpees'),
('Kettlebell Swing')
ON CONFLICT DO NOTHING;
