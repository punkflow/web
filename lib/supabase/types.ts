export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      captions: {
        Row: {
          episode_id: string
          format: string
          id: string
          is_auto_generated: boolean
          label: string | null
          language: string
          url: string
        }
        Insert: {
          episode_id: string
          format?: string
          id?: string
          is_auto_generated?: boolean
          label?: string | null
          language: string
          url: string
        }
        Update: {
          episode_id?: string
          format?: string
          id?: string
          is_auto_generated?: boolean
          label?: string | null
          language?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "captions_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          accent_color: string | null
          at_did: string | null
          at_handle: string | null
          at_handle_verified: boolean
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          name: string
          slug: string
          studio_id: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          at_did?: string | null
          at_handle?: string | null
          at_handle_verified?: boolean
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          name: string
          slug: string
          studio_id: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          at_did?: string | null
          at_handle?: string | null
          at_handle_verified?: boolean
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          name?: string
          slug?: string
          studio_id?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          episode_id: string
          id: string
          ordinal: number
          start_seconds: number
          title: string
        }
        Insert: {
          episode_id: string
          id?: string
          ordinal: number
          start_seconds: number
          title: string
        }
        Update: {
          episode_id?: string
          id?: string
          ordinal?: number
          start_seconds?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          at_did: string | null
          episode_id: string
          id: string
          name: string | null
          ordinal: number
          role: string
          url: string | null
        }
        Insert: {
          at_did?: string | null
          episode_id: string
          id?: string
          name?: string | null
          ordinal: number
          role: string
          url?: string | null
        }
        Update: {
          at_did?: string | null
          episode_id?: string
          id?: string
          name?: string | null
          ordinal?: number
          role?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_content_warnings: {
        Row: {
          episode_id: string
          warning: string
        }
        Insert: {
          episode_id: string
          warning: string
        }
        Update: {
          episode_id?: string
          warning?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_content_warnings_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_copublishers: {
        Row: {
          channel_id: string | null
          episode_id: string
          external_at_did: string | null
          external_at_handle: string | null
          external_avatar_url: string | null
          external_display_name: string | null
          external_profile_url: string | null
          ordinal: number
          reference_at_uri: string | null
        }
        Insert: {
          channel_id?: string | null
          episode_id: string
          external_at_did?: string | null
          external_at_handle?: string | null
          external_avatar_url?: string | null
          external_display_name?: string | null
          external_profile_url?: string | null
          ordinal: number
          reference_at_uri?: string | null
        }
        Update: {
          channel_id?: string | null
          episode_id?: string
          external_at_did?: string | null
          external_at_handle?: string | null
          external_avatar_url?: string | null
          external_display_name?: string | null
          external_profile_url?: string | null
          ordinal?: number
          reference_at_uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episode_copublishers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_copublishers_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_production_tools: {
        Row: {
          episode_id: string
          id: string
          ordinal: number
          tool_name: string
          tool_role: string | null
          tool_version: string | null
          url: string | null
        }
        Insert: {
          episode_id: string
          id?: string
          ordinal: number
          tool_name: string
          tool_role?: string | null
          tool_version?: string | null
          url?: string | null
        }
        Update: {
          episode_id?: string
          id?: string
          ordinal?: number
          tool_name?: string
          tool_role?: string | null
          tool_version?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episode_production_tools_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_tags: {
        Row: {
          episode_id: string
          tag_id: string
        }
        Insert: {
          episode_id: string
          tag_id: string
        }
        Update: {
          episode_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_tags_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          access_model: Database["public"]["Enums"]["access_model"]
          age_restriction: Database["public"]["Enums"]["age_restriction"]
          ai_excerpting: boolean
          ai_generation: boolean
          ai_search_indexing: boolean
          ai_semantic_embedding: boolean
          ai_summarization: boolean
          ai_training: boolean
          aspect_ratio: string | null
          at_uri: string | null
          canon_status: Database["public"]["Enums"]["canon_status"]
          category: string | null
          channel_id: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          language: string
          license: string | null
          playback_url: string | null
          preview_url: string | null
          provider_metadata: Json
          provider_video_id: string
          published_at: string | null
          replacement_reason: string | null
          replaces: string | null
          scheduled_for: string | null
          search_vector: unknown
          season: number | null
          series_id: string | null
          series_index: number | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_provider: Database["public"]["Enums"]["video_provider"]
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          access_model?: Database["public"]["Enums"]["access_model"]
          age_restriction?: Database["public"]["Enums"]["age_restriction"]
          ai_excerpting?: boolean
          ai_generation?: boolean
          ai_search_indexing?: boolean
          ai_semantic_embedding?: boolean
          ai_summarization?: boolean
          ai_training?: boolean
          aspect_ratio?: string | null
          at_uri?: string | null
          canon_status?: Database["public"]["Enums"]["canon_status"]
          category?: string | null
          channel_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string
          license?: string | null
          playback_url?: string | null
          preview_url?: string | null
          provider_metadata?: Json
          provider_video_id: string
          published_at?: string | null
          replacement_reason?: string | null
          replaces?: string | null
          scheduled_for?: string | null
          search_vector?: unknown
          season?: number | null
          series_id?: string | null
          series_index?: number | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_provider: Database["public"]["Enums"]["video_provider"]
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          access_model?: Database["public"]["Enums"]["access_model"]
          age_restriction?: Database["public"]["Enums"]["age_restriction"]
          ai_excerpting?: boolean
          ai_generation?: boolean
          ai_search_indexing?: boolean
          ai_semantic_embedding?: boolean
          ai_summarization?: boolean
          ai_training?: boolean
          aspect_ratio?: string | null
          at_uri?: string | null
          canon_status?: Database["public"]["Enums"]["canon_status"]
          category?: string | null
          channel_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string
          license?: string | null
          playback_url?: string | null
          preview_url?: string | null
          provider_metadata?: Json
          provider_video_id?: string
          published_at?: string | null
          replacement_reason?: string | null
          replaces?: string | null
          scheduled_for?: string | null
          search_vector?: unknown
          season?: number | null
          series_id?: string | null
          series_index?: number | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_provider?: Database["public"]["Enums"]["video_provider"]
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "episodes_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_replaces_fkey"
            columns: ["replaces"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          at_uri: string | null
          channel_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          poster_url: string | null
          slug: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          at_uri?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          poster_url?: string | null
          slug: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          at_uri?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          poster_url?: string | null
          slug?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_disclosures: {
        Row: {
          disclosure_type: string
          episode_id: string
          id: string
          ordinal: number
          sponsor_name: string
          url: string | null
        }
        Insert: {
          disclosure_type: string
          episode_id: string
          id?: string
          ordinal: number
          sponsor_name: string
          url?: string | null
        }
        Update: {
          disclosure_type?: string
          episode_id?: string
          id?: string
          ordinal?: number
          sponsor_name?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_disclosures_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          accent_color: string | null
          at_did: string | null
          at_handle: string | null
          at_handle_verified: boolean
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          manifesto_url: string | null
          name: string
          slug: string
          tagline: string | null
          updated_at: string
          values_statement: string | null
        }
        Insert: {
          accent_color?: string | null
          at_did?: string | null
          at_handle?: string | null
          at_handle_verified?: boolean
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manifesto_url?: string | null
          name: string
          slug: string
          tagline?: string | null
          updated_at?: string
          values_statement?: string | null
        }
        Update: {
          accent_color?: string | null
          at_did?: string | null
          at_handle?: string | null
          at_handle_verified?: boolean
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manifesto_url?: string | null
          name?: string
          slug?: string
          tagline?: string | null
          updated_at?: string
          values_statement?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          kind: string
          label: string
          slug: string
        }
        Insert: {
          id?: string
          kind?: string
          label: string
          slug: string
        }
        Update: {
          id?: string
          kind?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      transcript_segments: {
        Row: {
          duration_seconds: number
          episode_id: string
          id: string
          ordinal: number
          speaker: string | null
          start_seconds: number
          text: string
        }
        Insert: {
          duration_seconds: number
          episode_id: string
          id?: string
          ordinal: number
          speaker?: string | null
          start_seconds: number
          text: string
        }
        Update: {
          duration_seconds?: number
          episode_id?: string
          id?: string
          ordinal?: number
          speaker?: string | null
          start_seconds?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_segments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      access_model:
        | "free"
        | "tip_supported"
        | "paid"
        | "patron_tier"
        | "rental"
        | "subscription"
      age_restriction: "none" | "mild" | "teen" | "mature"
      canon_status:
        | "canon"
        | "non_canon"
        | "side_story"
        | "alternate"
        | "draft"
        | "pilot"
        | "behind_scenes"
        | "restoration"
        | "directors_cut"
      video_provider: "cloudflare_stream" | "mux" | "self_hosted" | "external"
      visibility: "public" | "unlisted" | "private" | "scheduled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
