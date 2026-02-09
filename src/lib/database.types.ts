export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          exercise_name: string
          weight: number
          sets: number
          reps: number
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          exercise_name: string
          weight: number
          sets: number
          reps: number
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          exercise_name?: string
          weight?: number
          sets?: number
          reps?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      template_exercises: {
        Row: {
          id: string
          user_id: string
          template_id: string
          exercise_name: string
          sets: number
          reps: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          exercise_name: string
          sets: number
          reps: number
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          exercise_name?: string
          sets?: number
          reps?: number
          order_index?: number
          created_at?: string
        }
      }
      common_exercises: {
        Row: {
          exercise_name: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
