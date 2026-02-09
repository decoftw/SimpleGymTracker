export interface WorkoutSession {
  id: string;
  user_id: string;
  title: string;
  date: string;
  created_at: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  weight: number;
  sets: number;
  reps: number;
  order_index: number;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  exercises?: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  order_index: number;
}

export interface CreateTemplateExercise {
  exercise_name: string;
  sets: number;
  reps: number;
}
