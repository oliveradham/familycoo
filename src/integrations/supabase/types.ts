export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_kind: string
          created_at: string
          details: Json | null
          household_id: string
          id: string
          items_created: number
          ran_at: string
          status: string
          summary: string | null
        }
        Insert: {
          agent_kind: string
          created_at?: string
          details?: Json | null
          household_id: string
          id?: string
          items_created?: number
          ran_at?: string
          status?: string
          summary?: string | null
        }
        Update: {
          agent_kind?: string
          created_at?: string
          details?: Json | null
          household_id?: string
          id?: string
          items_created?: number
          ran_at?: string
          status?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          action_kind: string
          created_at: string
          created_by_agent: string | null
          error: string | null
          executed_at: string | null
          household_id: string
          id: string
          payload: Json
          reversible: boolean
          status: string
          steps: Json
          title: string
          undo_expires_at: string | null
          undo_token: Json | null
          updated_at: string
          why: string | null
        }
        Insert: {
          action_kind: string
          created_at?: string
          created_by_agent?: string | null
          error?: string | null
          executed_at?: string | null
          household_id: string
          id?: string
          payload?: Json
          reversible?: boolean
          status?: string
          steps?: Json
          title: string
          undo_expires_at?: string | null
          undo_token?: Json | null
          updated_at?: string
          why?: string | null
        }
        Update: {
          action_kind?: string
          created_at?: string
          created_by_agent?: string | null
          error?: string | null
          executed_at?: string | null
          household_id?: string
          id?: string
          payload?: Json
          reversible?: boolean
          status?: string
          steps?: Json
          title?: string
          undo_expires_at?: string | null
          undo_token?: Json | null
          updated_at?: string
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      briefings: {
        Row: {
          briefing_date: string
          content: Json
          created_at: string
          generated_at: string
          household_id: string
          id: string
          kind: string
          updated_at: string
        }
        Insert: {
          briefing_date?: string
          content: Json
          created_at?: string
          generated_at?: string
          household_id: string
          id?: string
          kind?: string
          updated_at?: string
        }
        Update: {
          briefing_date?: string
          content?: Json
          created_at?: string
          generated_at?: string
          household_id?: string
          id?: string
          kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefings_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          ends_at: string | null
          household_id: string
          id: string
          location: string | null
          member_id: string | null
          notes: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          ends_at?: string | null
          household_id: string
          id?: string
          location?: string | null
          member_id?: string | null
          notes?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string | null
          household_id?: string
          id?: string
          location?: string | null
          member_id?: string | null
          notes?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_messages: {
        Row: {
          content: string
          created_at: string
          household_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          household_id: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          household_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concierge_messages_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          created_by: string
          family_member_id: string | null
          household_id: string
          id: string
          mime_type: string | null
          notes_enc: string | null
          size_bytes: number | null
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string
          family_member_id?: string | null
          household_id: string
          id?: string
          mime_type?: string | null
          notes_enc?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          family_member_id?: string | null
          household_id?: string
          id?: string
          mime_type?: string | null
          notes_enc?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          created_by: string
          currency: string
          family_member_id: string | null
          household_id: string
          id: string
          is_recurring: boolean
          merchant: string | null
          notes: string | null
          receipt_path: string | null
          spent_on: string
          subscription_period: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          category?: string
          created_at?: string
          created_by?: string
          currency?: string
          family_member_id?: string | null
          household_id: string
          id?: string
          is_recurring?: boolean
          merchant?: string | null
          notes?: string | null
          receipt_path?: string | null
          spent_on?: string
          subscription_period?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          created_by?: string
          currency?: string
          family_member_id?: string | null
          household_id?: string
          id?: string
          is_recurring?: boolean
          merchant?: string | null
          notes?: string | null
          receipt_path?: string | null
          spent_on?: string
          subscription_period?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          birth_date: string | null
          color: string | null
          created_at: string
          household_id: string
          id: string
          name: string
          notes: string | null
          role: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          color?: string | null
          created_at?: string
          household_id: string
          id?: string
          name: string
          notes?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          color?: string | null
          created_at?: string
          household_id?: string
          id?: string
          name?: string
          notes?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      family_memory: {
        Row: {
          category: string
          confidence: number
          created_at: string
          created_by: string | null
          expires_at: string | null
          fact: string
          household_id: string
          id: string
          source: string
          subject_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          confidence?: number
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          fact: string
          household_id: string
          id?: string
          source?: string
          subject_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          confidence?: number
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          fact?: string
          household_id?: string
          id?: string
          source?: string
          subject_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_memory_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_memory_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_items: {
        Row: {
          category: string
          created_at: string
          created_by: string
          household_id: string
          id: string
          low_at: number | null
          name: string
          notes: string | null
          qty: number | null
          status: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string
          household_id: string
          id?: string
          low_at?: number | null
          name: string
          notes?: string | null
          qty?: number | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          low_at?: number | null
          name?: string
          notes?: string | null
          qty?: number | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          id: string
          member_role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          member_role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          city: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by: string
          id?: string
          name?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inbox_items: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string | null
          due_at: string | null
          household_id: string
          id: string
          lane: string
          member_id: string | null
          raw_content: string | null
          sender: string | null
          source: string
          status: string
          subject: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          household_id: string
          id?: string
          lane?: string
          member_id?: string | null
          raw_content?: string | null
          sender?: string | null
          source?: string
          status?: string
          subject: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          household_id?: string
          id?: string
          lane?: string
          member_id?: string | null
          raw_content?: string | null
          sender?: string | null
          source?: string
          status?: string
          subject?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_items_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          area: string
          created_at: string
          created_by: string
          frequency_days: number | null
          household_id: string
          id: string
          last_done_on: string | null
          next_due_on: string | null
          notes: string | null
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          area?: string
          created_at?: string
          created_by?: string
          frequency_days?: number | null
          household_id: string
          id?: string
          last_done_on?: string | null
          next_due_on?: string | null
          notes?: string | null
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          area?: string
          created_at?: string
          created_by?: string
          frequency_days?: number | null
          household_id?: string
          id?: string
          last_done_on?: string | null
          next_due_on?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string
          created_by: string
          detail_enc: string | null
          family_member_id: string | null
          household_id: string
          id: string
          kind: string
          next_due_on: string | null
          occurred_on: string | null
          policy_number_enc: string | null
          provider: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          detail_enc?: string | null
          family_member_id?: string | null
          household_id: string
          id?: string
          kind?: string
          next_due_on?: string | null
          occurred_on?: string | null
          policy_number_enc?: string | null
          provider?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          detail_enc?: string | null
          family_member_id?: string | null
          household_id?: string
          id?: string
          kind?: string
          next_due_on?: string | null
          occurred_on?: string | null
          policy_number_enc?: string | null
          provider?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          delivered_at: string | null
          error: string | null
          household_id: string | null
          id: string
          kind: string
          read_at: string | null
          ref_id: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          channel: string
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          household_id?: string | null
          id?: string
          kind: string
          read_at?: string | null
          ref_id?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          household_id?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          ref_id?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          afternoon_check_in_at: string | null
          autopilot_paused: boolean
          avatar_url: string | null
          created_at: string
          display_name: string | null
          evening_wrap_at: string | null
          id: string
          locale: string | null
          morning_briefing_at: string | null
          notification_channel: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          afternoon_check_in_at?: string | null
          autopilot_paused?: boolean
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          evening_wrap_at?: string | null
          id: string
          locale?: string | null
          morning_briefing_at?: string | null
          notification_channel?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          afternoon_check_in_at?: string | null
          autopilot_paused?: boolean
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          evening_wrap_at?: string | null
          id?: string
          locale?: string | null
          morning_briefing_at?: string | null
          notification_channel?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          platform: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          platform?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          platform?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      school_items: {
        Row: {
          amount_cents: number | null
          created_at: string
          created_by: string | null
          detail: string | null
          due_at: string | null
          household_id: string
          id: string
          kid_id: string | null
          kind: string
          source: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          created_by?: string | null
          detail?: string | null
          due_at?: string | null
          household_id: string
          id?: string
          kid_id?: string | null
          kind: string
          source?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          created_by?: string | null
          detail?: string | null
          due_at?: string | null
          household_id?: string
          id?: string
          kid_id?: string | null
          kind?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_items_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_events: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          equipment_note: string | null
          household_id: string
          id: string
          kind: string
          location: string | null
          notes: string | null
          starts_at: string
          status: string
          team_id: string
          updated_at: string
          weather_note: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          equipment_note?: string | null
          household_id: string
          id?: string
          kind: string
          location?: string | null
          notes?: string | null
          starts_at: string
          status?: string
          team_id: string
          updated_at?: string
          weather_note?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          equipment_note?: string | null
          household_id?: string
          id?: string
          kind?: string
          location?: string | null
          notes?: string | null
          starts_at?: string
          status?: string
          team_id?: string
          updated_at?: string
          weather_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sport_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_teams: {
        Row: {
          coach_contact: string | null
          created_at: string
          created_by: string | null
          household_id: string
          id: string
          kid_id: string | null
          notes: string | null
          ranking: string | null
          season: string | null
          sport: string
          team_name: string | null
          updated_at: string
        }
        Insert: {
          coach_contact?: string | null
          created_at?: string
          created_by?: string | null
          household_id: string
          id?: string
          kid_id?: string | null
          notes?: string | null
          ranking?: string | null
          season?: string | null
          sport: string
          team_name?: string | null
          updated_at?: string
        }
        Update: {
          coach_contact?: string | null
          created_at?: string
          created_by?: string | null
          household_id?: string
          id?: string
          kid_id?: string | null
          notes?: string | null
          ranking?: string | null
          season?: string | null
          sport?: string
          team_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sport_teams_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_teams_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_user_id: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          due_at: string | null
          household_id: string
          id: string
          member_id: string | null
          notes: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_user_id?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          due_at?: string | null
          household_id: string
          id?: string
          member_id?: string | null
          notes?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_user_id?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          due_at?: string | null
          household_id?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          created_by: string
          destination: string | null
          end_date: string | null
          household_id: string
          id: string
          notes: string | null
          start_date: string | null
          status: string
          title: string
          travelers: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          destination?: string | null
          end_date?: string | null
          household_id: string
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string
          title: string
          travelers?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          destination?: string | null
          end_date?: string | null
          household_id?: string
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string
          title?: string
          travelers?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          created_at: string
          generated_at: string
          headline: string
          household_id: string
          id: string
          stats: Json
          summary: string
          upcoming: Json
          updated_at: string
          week_start: string
          wins: Json
        }
        Insert: {
          created_at?: string
          generated_at?: string
          headline: string
          household_id: string
          id?: string
          stats?: Json
          summary: string
          upcoming?: Json
          updated_at?: string
          week_start: string
          wins?: Json
        }
        Update: {
          created_at?: string
          generated_at?: string
          headline?: string
          household_id?: string
          id?: string
          stats?: Json
          summary?: string
          upcoming?: Json
          updated_at?: string
          week_start?: string
          wins?: Json
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_household_member: {
        Args: { _household_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
