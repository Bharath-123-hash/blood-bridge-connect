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
      donor_responses: {
        Row: {
          created_at: string
          donor_id: string
          id: string
          request_id: string
          status: Database["public"]["Enums"]["response_status"]
        }
        Insert: {
          created_at?: string
          donor_id: string
          id?: string
          request_id: string
          status: Database["public"]["Enums"]["response_status"]
        }
        Update: {
          created_at?: string
          donor_id?: string
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["response_status"]
        }
        Relationships: [
          {
            foreignKeyName: "donor_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "emergency_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_requests: {
        Row: {
          area: string | null
          blood_group: Database["public"]["Enums"]["blood_group"]
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          hospital: string
          id: string
          lat: number | null
          lng: number | null
          patient_info: string | null
          requester_id: string
          status: Database["public"]["Enums"]["request_status"]
          units: number
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          area?: string | null
          blood_group: Database["public"]["Enums"]["blood_group"]
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          hospital: string
          id?: string
          lat?: number | null
          lng?: number | null
          patient_info?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["request_status"]
          units?: number
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          area?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"]
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          hospital?: string
          id?: string
          lat?: number | null
          lng?: number | null
          patient_info?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          units?: number
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          area: string | null
          available: boolean
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          created_at: string
          donation_count: number
          gender: string | null
          id: string
          last_donation_date: string | null
          lat: number | null
          lng: number | null
          name: string
          notify_push: boolean
          notify_sms: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          area?: string | null
          available?: boolean
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string
          donation_count?: number
          gender?: string | null
          id: string
          last_donation_date?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          notify_push?: boolean
          notify_sms?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          area?: string | null
          available?: boolean
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string
          donation_count?: number
          gender?: string | null
          id?: string
          last_donation_date?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          notify_push?: boolean
          notify_sms?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      blood_group: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-"
      request_status:
        | "open"
        | "fulfilled"
        | "cancelled"
        | "approved"
        | "rejected"
      response_status: "accepted" | "declined"
      urgency_level: "Critical" | "High" | "Moderate"
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
      app_role: ["admin", "moderator", "user"],
      blood_group: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      request_status: [
        "open",
        "fulfilled",
        "cancelled",
        "approved",
        "rejected",
      ],
      response_status: ["accepted", "declined"],
      urgency_level: ["Critical", "High", "Moderate"],
    },
  },
} as const
