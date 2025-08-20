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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string | null
          id: string
          model_used: string | null
          role: string | null
          session_id: string | null
          tokens_used: number | null
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          role?: string | null
          session_id?: string | null
          tokens_used?: number | null
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          role?: string | null
          session_id?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          context_id: string | null
          context_type: string | null
          id: string
          last_activity: string | null
          message_count: number | null
          session_context: Json | null
          session_title: string
          started_at: string | null
          total_tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          id?: string
          last_activity?: string | null
          message_count?: number | null
          session_context?: Json | null
          session_title: string
          started_at?: string | null
          total_tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          id?: string
          last_activity?: string | null
          message_count?: number | null
          session_context?: Json | null
          session_title?: string
          started_at?: string | null
          total_tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string
          id: number
          insight_type: string | null
          meeting_id: string | null
          project_id: number | null
          resolved: number | null
          severity: string | null
          source_meetings: string | null
          title: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description: string
          id?: number
          insight_type?: string | null
          meeting_id?: string | null
          project_id?: number | null
          resolved?: number | null
          severity?: string | null
          source_meetings?: string | null
          title: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          id?: number
          insight_type?: string | null
          meeting_id?: string | null
          project_id?: number | null
          resolved?: number | null
          severity?: string | null
          source_meetings?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_id: string | null
          created_at: string
          id: number
          name: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: number
          name?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: number
          name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          state: string | null
          title: string | null
          updated_at: string | null
          website: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          state?: string | null
          title?: string | null
          updated_at?: string | null
          website: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          state?: string | null
          title?: string | null
          updated_at?: string | null
          website?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          facebook: string | null
          first_name: string | null
          id: string
          instagram: string | null
          job_title: string | null
          last_name: string | null
          linkedin: string | null
          notes: string[] | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: string
          instagram?: string | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          notes?: string[] | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: string
          instagram?: string | null
          job_title?: string | null
          last_name?: string | null
          linkedin?: string | null
          notes?: string[] | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_history: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: number
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: number
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: number
          role?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meeting_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          embedding: string | null
          end_timestamp: number | null
          id: string
          meeting_id: string | null
          metadata: Json | null
          speaker_info: Json | null
          start_timestamp: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          embedding?: string | null
          end_timestamp?: number | null
          id?: string
          meeting_id?: string | null
          metadata?: Json | null
          speaker_info?: Json | null
          start_timestamp?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          embedding?: string | null
          end_timestamp?: number | null
          id?: string
          meeting_id?: string | null
          metadata?: Json | null
          speaker_info?: Json | null
          start_timestamp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_chunks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_summaries: {
        Row: {
          action_items: Json | null
          created_at: string | null
          id: string
          key_points: Json | null
          meeting_id: string | null
          sentiment_score: number | null
          summary_long: string | null
          summary_short: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string | null
          id?: string
          key_points?: Json | null
          meeting_id?: string | null
          sentiment_score?: number | null
          summary_long?: string | null
          summary_short: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string | null
          id?: string
          key_points?: Json | null
          meeting_id?: string | null
          sentiment_score?: number | null
          summary_long?: string | null
          summary_short?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_summaries_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          category: string | null
          created_at: string | null
          date: string
          id: string
          insights: number | null
          participants: string[] | null
          project_id: number | null
          raw_metadata: string | null
          storage_bucket_path: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          transcript_id: string | null
          transcript_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date: string
          id?: string
          insights?: number | null
          participants?: string[] | null
          project_id?: number | null
          raw_metadata?: string | null
          storage_bucket_path?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          transcript_id?: string | null
          transcript_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string
          id?: string
          insights?: number | null
          participants?: string[] | null
          project_id?: number | null
          raw_metadata?: string | null
          storage_bucket_path?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          transcript_id?: string | null
          transcript_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page: {
        Row: {
          checksum: string | null
          id: number
          meta: Json | null
          parent_page_id: number | null
          path: string
          source: string | null
          type: string | null
        }
        Insert: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path: string
          source?: string | null
          type?: string | null
        }
        Update: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path?: string
          source?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page_section: {
        Row: {
          content: string | null
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          slug: string | null
          token_count: number | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id: number
          slug?: string | null
          token_count?: number | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          slug?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_insights: {
        Row: {
          category: string
          created_at: string | null
          id: string
          meeting_id: string | null
          project_id: number | null
          text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          project_id?: number | null
          text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          project_id?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_insights_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: number | null
          status: string | null
          task_description: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: number | null
          status?: string | null
          task_description: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: number | null
          status?: string | null
          task_description?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          client_id: number | null
          created_at: string
          description: string | null
          "est completion": string | null
          "est profit": number | null
          "est revenue": number | null
          id: number
          "job number": string | null
          name: string | null
          onedrive: string | null
          phase: string | null
          "start date": string | null
          state: string | null
        }
        Insert: {
          address?: string | null
          client_id?: number | null
          created_at?: string
          description?: string | null
          "est completion"?: string | null
          "est profit"?: number | null
          "est revenue"?: number | null
          id?: number
          "job number"?: string | null
          name?: string | null
          onedrive?: string | null
          phase?: string | null
          "start date"?: string | null
          state?: string | null
        }
        Update: {
          address?: string | null
          client_id?: number | null
          created_at?: string
          description?: string | null
          "est completion"?: string | null
          "est profit"?: number | null
          "est revenue"?: number | null
          id?: number
          "job number"?: string | null
          name?: string | null
          onedrive?: string | null
          phase?: string | null
          "start date"?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_queries: {
        Row: {
          created_at: string | null
          feedback_rating: number | null
          feedback_text: string | null
          id: string
          query_text: string
          relevance_scores: number[] | null
          response: string | null
          retrieved_chunks: string[] | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          query_text: string
          relevance_scores?: number[] | null
          response?: string | null
          retrieved_chunks?: string[] | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          query_text?: string
          relevance_scores?: number[] | null
          response?: string | null
          retrieved_chunks?: string[] | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_queries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_successful_sync_at: string | null
          last_sync_at: string | null
          metadata: Json | null
          status: string | null
          sync_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_successful_sync_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          status?: string | null
          sync_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_successful_sync_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          status?: string | null
          sync_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_page_parents: {
        Args: { page_id: number }
        Returns: {
          id: number
          meta: Json
          parent_page_id: number
          path: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_session_tokens: {
        Args: { session_id: string; tokens_to_add: number }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_page_sections: {
        Args: {
          embedding: string
          match_count: number
          match_threshold: number
          min_content_length: number
        }
        Returns: {
          content: string
          heading: string
          id: number
          page_id: number
          similarity: number
          slug: string
        }[]
      }
      search_meeting_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          project_filter?: string
          query_embedding: string
        }
        Returns: {
          chunk_end_time: number
          chunk_index: number
          chunk_start_time: number
          chunk_text: string
          id: string
          meeting_date: string
          meeting_id: string
          meeting_title: string
          project_id: string
          project_title: string
          similarity: number
          speaker_info: Json
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
