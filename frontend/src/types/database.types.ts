/**
 * Generated from Supabase schema — regenerate with `npm run gen:types` (WO-007).
 * Source: infra/supabase/migrations/
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = 'employee' | 'manager' | 'hr_admin' | 'it_ops';

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          name: string;
          parent_department_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['departments']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['departments']['Row']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          department_id: string | null;
          manager_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          photo_url: string | null;
          job_title: string | null;
          start_date: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      task_progress: {
        Row: {
          id: string;
          plan_id: string;
          template_task_id: string;
          user_id: string;
          status: 'pending' | 'in_progress' | 'completed' | 'skipped';
          due_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['task_progress']['Row']> & {
          plan_id: string;
          template_task_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['task_progress']['Row']>;
        Relationships: [];
      };
      faq_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['faq_categories']['Row']> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['faq_categories']['Row']>;
        Relationships: [];
      };
      faq_articles: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          body: string;
          reviewed_at: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['faq_articles']['Row']> & {
          category_id: string;
          title: string;
          body: string;
        };
        Update: Partial<Database['public']['Tables']['faq_articles']['Row']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          channel: string;
          target_role: AppRole | null;
          status: 'pending' | 'sent' | 'failed' | 'read';
          payload: Json;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & { channel: string };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
        Relationships: [];
      };
      training_modules: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          video_provider: string | null;
          video_external_id: string | null;
          duration_seconds: number | null;
          required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['training_modules']['Row']> & { title: string };
        Update: Partial<Database['public']['Tables']['training_modules']['Row']>;
        Relationships: [];
      };
      video_progress: {
        Row: {
          id: string;
          module_id: string;
          user_id: string;
          watched_seconds: number;
          completed: boolean;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['video_progress']['Row']> & {
          module_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['video_progress']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      task_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
      plan_status: 'active' | 'completed' | 'cancelled';
      notification_status: 'pending' | 'sent' | 'failed' | 'read';
    };
    CompositeTypes: Record<string, never>;
  };
}
