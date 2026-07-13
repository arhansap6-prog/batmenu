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
      categories: {
        Row: {
          background_style: string | null
          created_at: string
          emoji: string | null
          hidden: boolean
          id: string
          name: string
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          background_style?: string | null
          created_at?: string
          emoji?: string | null
          hidden?: boolean
          id?: string
          name: string
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          background_style?: string | null
          created_at?: string
          emoji?: string | null
          hidden?: boolean
          id?: string
          name?: string
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_bestseller: boolean
          is_special: boolean
          name: string
          out_of_stock: boolean
          price: number
          restaurant_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_bestseller?: boolean
          is_special?: boolean
          name: string
          out_of_stock?: boolean
          price?: number
          restaurant_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_bestseller?: boolean
          is_special?: boolean
          name?: string
          out_of_stock?: boolean
          price?: number
          restaurant_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_templates: {
        Row: {
          category: string
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_premium: boolean
          name: string
          preview_url: string | null
          updated_at: string
        }
        Insert: {
          category: string
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          name: string
          preview_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          name?: string
          preview_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotional_videos: {
        Row: {
          allow_mute: boolean
          created_at: string
          duration_seconds: number | null
          enabled: boolean
          file_size_bytes: number | null
          format: string | null
          id: string
          loop_video: boolean
          poster_url: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          show_skip_button: boolean
          show_watermark: boolean
          updated_at: string
          uploaded_by: string | null
          video_url: string
        }
        Insert: {
          allow_mute?: boolean
          created_at?: string
          duration_seconds?: number | null
          enabled?: boolean
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          loop_video?: boolean
          poster_url?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          show_skip_button?: boolean
          show_watermark?: boolean
          updated_at?: string
          uploaded_by?: string | null
          video_url: string
        }
        Update: {
          allow_mute?: boolean
          created_at?: string
          duration_seconds?: number | null
          enabled?: boolean
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          loop_video?: boolean
          poster_url?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          show_skip_button?: boolean
          show_watermark?: boolean
          updated_at?: string
          uploaded_by?: string | null
          video_url?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          id: string
          restaurant_id: string
          scanned_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          scanned_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          scanned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          active_template_id: string | null
          address: string | null
          assigned_template_ids: string[]
          banner_url: string | null
          business_type: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          opening_hours: string | null
          owner_email: string | null
          owner_id: string | null
          owner_name: string | null
          phone: string | null
          primary_color: string
          secondary_color: string
          slug: string
          status: string
          theme: string
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          active_template_id?: string | null
          address?: string | null
          assigned_template_ids?: string[]
          banner_url?: string | null
          business_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          opening_hours?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          slug: string
          status?: string
          theme?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          active_template_id?: string | null
          address?: string | null
          assigned_template_ids?: string[]
          banner_url?: string | null
          business_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          opening_hours?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          slug?: string
          status?: string
          theme?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_active_template_id_fkey"
            columns: ["active_template_id"]
            isOneToOne: false
            referencedRelation: "menu_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_super_admin: { Args: never; Returns: undefined }
      current_role_name: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      super_admin_exists: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "restaurant_admin"
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
      app_role: ["super_admin", "restaurant_admin"],
    },
  },
} as const
