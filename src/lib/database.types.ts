export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// AIndieStore Database Schema Types
export interface Database {
  public: {
    Tables: {
      // User profiles with theme preferences
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          theme_preference: 'light' | 'dark' | 'system'
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          theme_preference?: 'light' | 'dark' | 'system'
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          theme_preference?: 'light' | 'dark' | 'system'
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      
      // File management system
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          path: string
          size: number
          mime_type: string
          folder_id: string | null
          metadata: Json
          is_public: boolean
          upload_progress: number
          status: 'uploading' | 'completed' | 'error' | 'processing'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          path: string
          size: number
          mime_type: string
          folder_id?: string | null
          metadata?: Json
          is_public?: boolean
          upload_progress?: number
          status?: 'uploading' | 'completed' | 'error' | 'processing'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          path?: string
          size?: number
          mime_type?: string
          folder_id?: string | null
          metadata?: Json
          is_public?: boolean
          upload_progress?: number
          status?: 'uploading' | 'completed' | 'error' | 'processing'
          created_at?: string
          updated_at?: string
        }
      }

      // Folder structure
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          path: string
          color: string | null
          description: string | null
          is_shared: boolean
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_id?: string | null
          path: string
          color?: string | null
          description?: string | null
          is_shared?: boolean
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_id?: string | null
          path?: string
          color?: string | null
          description?: string | null
          is_shared?: boolean
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }

      // MCP configurations
      mcp_configurations: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          app_id: string
          base_url: string
          config: Json
          is_active: boolean
          performance_metrics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          app_id: string
          base_url: string
          config?: Json
          is_active?: boolean
          performance_metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          app_id?: string
          base_url?: string
          config?: Json
          is_active?: boolean
          performance_metrics?: Json
          created_at?: string
          updated_at?: string
        }
      }

      // Activity logs for auditing
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }

      // API keys and security
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          permissions: Json
          last_used: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          permissions?: Json
          last_used?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          permissions?: Json
          last_used?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }

      // Performance analytics
      performance_metrics: {
        Row: {
          id: string
          user_id: string
          metric_type: string
          value: number
          metadata: Json
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_type: string
          value: number
          metadata?: Json
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_type?: string
          value?: number
          metadata?: Json
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      theme_preference: 'light' | 'dark' | 'system'
      file_status: 'uploading' | 'completed' | 'error' | 'processing'
    }
  }
}

// Helper types for the application
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type FileRecord = Database['public']['Tables']['files']['Row']
export type FolderRecord = Database['public']['Tables']['folders']['Row']
export type MCPConfiguration = Database['public']['Tables']['mcp_configurations']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type APIKey = Database['public']['Tables']['api_keys']['Row']
export type PerformanceMetric = Database['public']['Tables']['performance_metrics']['Row']

// Insert types
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type FileInsert = Database['public']['Tables']['files']['Insert']
export type FolderInsert = Database['public']['Tables']['folders']['Insert']
export type MCPConfigurationInsert = Database['public']['Tables']['mcp_configurations']['Insert']
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']
export type APIKeyInsert = Database['public']['Tables']['api_keys']['Insert']
export type PerformanceMetricInsert = Database['public']['Tables']['performance_metrics']['Insert']

// Update types  
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type FileUpdate = Database['public']['Tables']['files']['Update']
export type FolderUpdate = Database['public']['Tables']['folders']['Update']
export type MCPConfigurationUpdate = Database['public']['Tables']['mcp_configurations']['Update']
export type ActivityLogUpdate = Database['public']['Tables']['activity_logs']['Update']
export type APIKeyUpdate = Database['public']['Tables']['api_keys']['Update']
export type PerformanceMetricUpdate = Database['public']['Tables']['performance_metrics']['Update']
