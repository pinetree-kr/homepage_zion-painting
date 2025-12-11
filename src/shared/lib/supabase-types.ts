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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: unknown
          log_type: Database["public"]["Enums"]["log_type"]
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: unknown
          log_type: Database["public"]["Enums"]["log_type"]
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: unknown
          log_type?: Database["public"]["Enums"]["log_type"]
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      administrators: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      board_categories: {
        Row: {
          board_id: string | null
          created_at: string | null
          display_order: number
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          board_id?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          board_id?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_categories_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      board_policies: {
        Row: {
          board_id: string
          cmt_create: boolean
          cmt_delete: boolean
          cmt_edit: boolean
          cmt_read: boolean
          created_at: string | null
          file_download: boolean
          file_upload: boolean
          post_create: boolean
          post_delete: boolean
          post_edit: boolean
          post_list: boolean
          post_read: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          board_id: string
          cmt_create?: boolean
          cmt_delete?: boolean
          cmt_edit?: boolean
          cmt_read?: boolean
          created_at?: string | null
          file_download?: boolean
          file_upload?: boolean
          post_create?: boolean
          post_delete?: boolean
          post_edit?: boolean
          post_list?: boolean
          post_read?: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          board_id?: string
          cmt_create?: boolean
          cmt_delete?: boolean
          cmt_edit?: boolean
          cmt_read?: boolean
          created_at?: string | null
          file_download?: boolean
          file_upload?: boolean
          post_create?: boolean
          post_delete?: boolean
          post_edit?: boolean
          post_list?: boolean
          post_read?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_policies_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          code: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          display_order: number
          id: string
          name: string
          updated_at: string | null
          visibility: Database["public"]["Enums"]["visible_type"]
        }
        Insert: {
          code: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visible_type"]
        }
        Update: {
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visible_type"]
        }
        Relationships: []
      }
      business_achievements: {
        Row: {
          achievement_date: string
          category_id: string | null
          content: string
          content_summary: string
          created_at: string | null
          deleted_at: string | null
          id: string
          status: Database["public"]["Enums"]["document_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          achievement_date: string
          category_id?: string | null
          content: string
          content_summary?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["document_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          achievement_date?: string
          category_id?: string | null
          content?: string
          content_summary?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["document_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_achievements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string | null
          author_metadata: Json | null
          context: string
          created_at: string | null
          deleted_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          author_metadata?: Json | null
          context?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          author_metadata?: Json | null
          context?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          code: string
          created_at: string | null
          display_order: number
          id: string
          metadata: Json
          page: string
          section_type: string
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          display_order?: number
          id?: string
          metadata?: Json
          page: string
          section_type: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          display_order?: number
          id?: string
          metadata?: Json
          page?: string
          section_type?: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          author_metadata: Json | null
          board_id: string | null
          category_id: string | null
          comment_count: number
          content: string
          content_metadata: Json | null
          created_at: string | null
          deleted_at: string | null
          extra_json: string | null
          files: Json | null
          id: string
          is_pinned: boolean
          like_count: number
          status: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at: string | null
          view_count: number
        }
        Insert: {
          author_id?: string | null
          author_metadata?: Json | null
          board_id?: string | null
          category_id?: string | null
          comment_count?: number
          content: string
          content_metadata?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          extra_json?: string | null
          files?: Json | null
          id?: string
          is_pinned?: boolean
          like_count?: number
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at?: string | null
          view_count?: number
        }
        Update: {
          author_id?: string | null
          author_metadata?: Json | null
          board_id?: string | null
          category_id?: string | null
          comment_count?: number
          content?: string
          content_metadata?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          extra_json?: string | null
          files?: Json | null
          id?: string
          is_pinned?: boolean
          like_count?: number
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          updated_at?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "board_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_inquiries: {
        Row: {
          budget_max: number
          budget_min: number
          company_name: string | null
          created_at: string | null
          deleted_at: string | null
          expected_end_at: string | null
          expected_start_at: string | null
          id: string
          inquiry_status: Database["public"]["Enums"]["inquiry_status"]
          internal_notes: string | null
          post_id: string
          priority: Database["public"]["Enums"]["inquiry_priority"]
          product_id: string
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at: string | null
        }
        Insert: {
          budget_max?: number
          budget_min?: number
          company_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expected_end_at?: string | null
          expected_start_at?: string | null
          id?: string
          inquiry_status?: Database["public"]["Enums"]["inquiry_status"]
          internal_notes?: string | null
          post_id: string
          priority?: Database["public"]["Enums"]["inquiry_priority"]
          product_id: string
          type?: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string | null
        }
        Update: {
          budget_max?: number
          budget_min?: number
          company_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expected_end_at?: string | null
          expected_start_at?: string | null
          id?: string
          inquiry_status?: Database["public"]["Enums"]["inquiry_status"]
          internal_notes?: string | null
          post_id?: string
          priority?: Database["public"]["Enums"]["inquiry_priority"]
          product_id?: string
          type?: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inquiries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          cons: string
          created_at: string | null
          deleted_at: string | null
          id: string
          post_id: string
          product_id: string
          pros: string
          purchase_date: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          cons?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          post_id: string
          product_id: string
          pros?: string
          purchase_date: string
          rating?: number
          updated_at?: string | null
        }
        Update: {
          cons?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          post_id?: string
          product_id?: string
          pros?: string
          purchase_date?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          content: string
          content_summary: string
          created_at: string | null
          deleted_at: string | null
          extra_json: string | null
          id: string
          specs: Json | null
          status: Database["public"]["Enums"]["document_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content: string
          content_summary?: string
          created_at?: string | null
          deleted_at?: string | null
          extra_json?: string | null
          id?: string
          specs?: Json | null
          status?: Database["public"]["Enums"]["document_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string
          content_summary?: string
          created_at?: string | null
          deleted_at?: string | null
          extra_json?: string | null
          id?: string
          specs?: Json | null
          status?: Database["public"]["Enums"]["document_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id: string
          metadata?: Json | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact: Json | null
          created_at: string | null
          default_boards: Json | null
          deleted_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          contact?: Json | null
          created_at?: string | null
          default_boards?: Json | null
          deleted_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          contact?: Json | null
          created_at?: string | null
          default_boards?: Json | null
          deleted_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      terms_agreements: {
        Row: {
          agreed: boolean
          agreed_at: string | null
          agreement_type: string
          created_at: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          agreed?: boolean
          agreed_at?: string | null
          agreement_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
          version: string
        }
        Update: {
          agreed?: boolean
          agreed_at?: string | null
          agreement_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_board_permission: {
        Args: { p_board_id: string; p_permission: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_activity_logs: { Args: never; Returns: number }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "system" | "contents"
      app_role: "member" | "admin"
      document_status: "draft" | "published"
      inquiry_priority: "low" | "medium" | "high"
      inquiry_status: "pending" | "approved" | "answered" | "rejected"
      inquiry_type: "general" | "quote"
      log_type:
        | "USER_SIGNUP"
        | "ADMIN_SIGNUP"
        | "LOGIN_FAILED"
        | "ADMIN_LOGIN"
        | "SECTION_SETTING_CHANGE"
        | "BOARD_CREATE"
        | "BOARD_UPDATE"
        | "BOARD_DELETE"
        | "POST_CREATE"
        | "POST_UPDATE"
        | "POST_DELETE"
        | "POST_ANSWER"
        | "COMMENT_CREATE"
        | "COMMENT_UPDATE"
        | "COMMENT_DELETE"
        | "ERROR"
      visible_type: "public" | "member" | "owner"
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
      admin_role: ["system", "contents"],
      app_role: ["member", "admin"],
      document_status: ["draft", "published"],
      inquiry_priority: ["low", "medium", "high"],
      inquiry_status: ["pending", "approved", "answered", "rejected"],
      inquiry_type: ["general", "quote"],
      log_type: [
        "USER_SIGNUP",
        "ADMIN_SIGNUP",
        "LOGIN_FAILED",
        "ADMIN_LOGIN",
        "SECTION_SETTING_CHANGE",
        "BOARD_CREATE",
        "BOARD_UPDATE",
        "BOARD_DELETE",
        "POST_CREATE",
        "POST_UPDATE",
        "POST_DELETE",
        "POST_ANSWER",
        "COMMENT_CREATE",
        "COMMENT_UPDATE",
        "COMMENT_DELETE",
        "ERROR",
      ],
      visible_type: ["public", "member", "owner"],
    },
  },
} as const
