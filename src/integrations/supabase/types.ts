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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      car_request_submissions: {
        Row: {
          created_at: string
          email: string | null
          email_id: string | null
          email_status: string
          id: string
          model: string
          name: string
          phone: string
          request_data: Json
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_id?: string | null
          email_status?: string
          id?: string
          model: string
          name: string
          phone: string
          request_data: Json
        }
        Update: {
          created_at?: string
          email?: string | null
          email_id?: string | null
          email_status?: string
          id?: string
          model?: string
          name?: string
          phone?: string
          request_data?: Json
        }
        Relationships: []
      }
      encar_facets_cache: {
        Row: {
          key: string
          payload: Json
          updated_at: string
        }
        Insert: {
          key: string
          payload?: Json
          updated_at?: string
        }
        Update: {
          key?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      encar_listing_details: {
        Row: {
          encar_id: string
          error: string | null
          fetched_at: string
          inspection: Json | null
          record: Json | null
          vehicle: Json | null
        }
        Insert: {
          encar_id: string
          error?: string | null
          fetched_at?: string
          inspection?: Json | null
          record?: Json | null
          vehicle?: Json | null
        }
        Update: {
          encar_id?: string
          error?: string | null
          fetched_at?: string
          inspection?: Json | null
          record?: Json | null
          vehicle?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "encar_listing_details_encar_id_fkey"
            columns: ["encar_id"]
            isOneToOne: true
            referencedRelation: "encar_listings"
            referencedColumns: ["encar_id"]
          },
        ]
      }
      encar_listings: {
        Row: {
          body_type: string | null
          brand_name: string | null
          brand_slug: string | null
          color: string | null
          created_at: string
          encar_id: string
          engine_cc: number | null
          first_seen_at: string
          fuel_type: string | null
          has_accident: boolean | null
          id: string
          last_seen_at: string
          listing_url: string | null
          mileage: number | null
          model_name: string | null
          model_slug: string | null
          photos: Json
          previous_price_krw: number | null
          price_changed_at: string | null
          price_original: number | null
          raw_data: Json
          region: string | null
          source_code: string
          status: string
          thumb: string | null
          transmission: string | null
          trim: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          body_type?: string | null
          brand_name?: string | null
          brand_slug?: string | null
          color?: string | null
          created_at?: string
          encar_id: string
          engine_cc?: number | null
          first_seen_at?: string
          fuel_type?: string | null
          has_accident?: boolean | null
          id?: string
          last_seen_at?: string
          listing_url?: string | null
          mileage?: number | null
          model_name?: string | null
          model_slug?: string | null
          photos?: Json
          previous_price_krw?: number | null
          price_changed_at?: string | null
          price_original?: number | null
          raw_data?: Json
          region?: string | null
          source_code?: string
          status?: string
          thumb?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          body_type?: string | null
          brand_name?: string | null
          brand_slug?: string | null
          color?: string | null
          created_at?: string
          encar_id?: string
          engine_cc?: number | null
          first_seen_at?: string
          fuel_type?: string | null
          has_accident?: boolean | null
          id?: string
          last_seen_at?: string
          listing_url?: string | null
          mileage?: number | null
          model_name?: string | null
          model_slug?: string | null
          photos?: Json
          previous_price_krw?: number | null
          price_changed_at?: string | null
          price_original?: number | null
          raw_data?: Json
          region?: string | null
          source_code?: string
          status?: string
          thumb?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      encar_model_body: {
        Row: {
          body_type: string
          category: string
          category_count: number
          manufacturer: string
          model: string
        }
        Insert: {
          body_type: string
          category: string
          category_count?: number
          manufacturer: string
          model: string
        }
        Update: {
          body_type?: string
          category?: string
          category_count?: number
          manufacturer?: string
          model?: string
        }
        Relationships: []
      }
      encar_sync_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      encar_sync_lock: {
        Row: {
          id: number
          locked_until: string | null
        }
        Insert: {
          id: number
          locked_until?: string | null
        }
        Update: {
          id?: number
          locked_until?: string | null
        }
        Relationships: []
      }
      encar_sync_runs: {
        Row: {
          build_maker_idx: number
          build_stack: Json | null
          error: string | null
          finished_at: string | null
          id: string
          kind: string
          makers: Json | null
          marked_sold: number
          pages: number
          paused_until: string | null
          started_at: string
          status: string
          upserted: number
          windows_built: boolean
        }
        Insert: {
          build_maker_idx?: number
          build_stack?: Json | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          makers?: Json | null
          marked_sold?: number
          pages?: number
          paused_until?: string | null
          started_at?: string
          status?: string
          upserted?: number
          windows_built?: boolean
        }
        Update: {
          build_maker_idx?: number
          build_stack?: Json | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          makers?: Json | null
          marked_sold?: number
          pages?: number
          paused_until?: string | null
          started_at?: string
          status?: string
          upserted?: number
          windows_built?: boolean
        }
        Relationships: []
      }
      encar_sync_windows: {
        Row: {
          car_type: string
          done: boolean
          fetched: number
          id: number
          maker: string
          next_offset: number
          price_hi: number | null
          price_lo: number | null
          run_id: string
          total: number
        }
        Insert: {
          car_type: string
          done?: boolean
          fetched?: number
          id?: number
          maker: string
          next_offset?: number
          price_hi?: number | null
          price_lo?: number | null
          run_id: string
          total?: number
        }
        Update: {
          car_type?: string
          done?: boolean
          fetched?: number
          id?: number
          maker?: string
          next_offset?: number
          price_hi?: number | null
          price_lo?: number | null
          run_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "encar_sync_windows_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "encar_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          listing_id: string | null
          notification_type: string
          payload: Json
          scheduled_for: string
          sent_at: string | null
          status: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          listing_id?: string | null
          notification_type?: string
          payload?: Json
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          listing_id?: string | null
          notification_type?: string
          payload?: Json
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "encar_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_config: {
        Row: {
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          key: string
          updated_at?: string
          value: number
        }
        Update: {
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          criteria: Json
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          criteria?: Json
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          criteria?: Json
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      encar_backfill_model_body: { Args: { _limit?: number }; Returns: number }
      encar_brands: {
        Args: never
        Returns: {
          name: string
          slug: string
        }[]
      }
      encar_facets:
        | {
            Args: {
              _body_types?: string[]
              _brand?: string
              _fuels?: string[]
              _mileage_max?: number
              _mileage_min?: number
              _model?: string
              _no_accident?: boolean
              _price_max?: number
              _price_min?: number
              _regions?: string[]
              _transmissions?: string[]
              _year_from?: number
              _year_to?: number
            }
            Returns: Json
          }
        | {
            Args: {
              _body_types?: string[]
              _brands: string[]
              _fuels?: string[]
              _mileage_max?: number
              _mileage_min?: number
              _models: string[]
              _no_accident?: boolean
              _price_max?: number
              _price_min?: number
              _regions?: string[]
              _transmissions?: string[]
              _year_from?: number
              _year_to?: number
            }
            Returns: Json
          }
      encar_models: {
        Args: { _brand: string }
        Returns: {
          name: string
          slug: string
        }[]
      }
      encar_random_listings: {
        Args: { _n?: number }
        Returns: {
          body_type: string | null
          brand_name: string | null
          brand_slug: string | null
          color: string | null
          created_at: string
          encar_id: string
          engine_cc: number | null
          first_seen_at: string
          fuel_type: string | null
          has_accident: boolean | null
          id: string
          last_seen_at: string
          listing_url: string | null
          mileage: number | null
          model_name: string | null
          model_slug: string | null
          photos: Json
          previous_price_krw: number | null
          price_changed_at: string | null
          price_original: number | null
          raw_data: Json
          region: string | null
          source_code: string
          status: string
          thumb: string | null
          transmission: string | null
          trim: string | null
          updated_at: string
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "encar_listings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      encar_refresh_default_facets: { Args: never; Returns: undefined }
      encar_sanitize_facets_payload: {
        Args: { _grouped?: boolean; _payload: Json }
        Returns: Json
      }
      encar_sync_release_lock: { Args: never; Returns: undefined }
      encar_sync_status: {
        Args: never
        Returns: {
          error: string
          finished_at: string
          id: string
          kind: string
          marked_sold: number
          pages: number
          progress_pct: number
          started_at: string
          status: string
          sum_fetched: number
          sum_total: number
          upserted: number
          windows: number
          windows_built: boolean
          windows_done: number
        }[]
      }
      encar_sync_try_lock: { Args: { _seconds?: number }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
