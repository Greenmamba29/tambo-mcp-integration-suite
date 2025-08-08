import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Supabase configuration for AIndieStore database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Enhanced Supabase client with performance optimizations
export class EnhancedSupabaseClient {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  async queryWithCache<T>(
    key: string, 
    queryFn: () => Promise<T>,
    ttl = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T
    }

    const data = await queryFn()
    this.cache.set(key, { data, timestamp: Date.now() })
    
    return data
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  // Batch operations for better performance
  async batchInsert<T>(table: string, records: T[]): Promise<T[]> {
    const batchSize = 1000 // Supabase limit
    const batches: T[][] = []
    
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize))
    }

    const results: T[] = []
    
    for (const batch of batches) {
      const { data, error } = await supabase
        .from(table)
        .insert(batch)
        .select()
      
      if (error) throw error
      if (data) results.push(...data as T[])
    }

    return results
  }

  // Real-time subscription management
  subscriptions = new Map<string, any>()

  subscribe(
    channel: string,
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    const subscription = supabase
      .channel(channel)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter
      }, callback)
      .subscribe()

    this.subscriptions.set(channel, subscription)
    return subscription
  }

  unsubscribe(channel: string) {
    const subscription = this.subscriptions.get(channel)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(channel)
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channel) => {
      subscription.unsubscribe()
    })
    this.subscriptions.clear()
  }
}

export const enhancedSupabase = new EnhancedSupabaseClient()

// File storage utilities
export class FileStorageManager {
  private readonly BUCKET_NAME = 'files'

  async uploadFile(
    file: File, 
    path: string, 
    options?: {
      upsert?: boolean
      cacheControl?: string
      contentType?: string
    }
  ) {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
        contentType: options?.contentType || file.type
      })

    if (error) throw error
    return data
  }

  async uploadMultipleFiles(
    files: Array<{ file: File, path: string }>,
    onProgress?: (progress: number) => void
  ) {
    const results = []
    let completed = 0

    for (const { file, path } of files) {
      try {
        const result = await this.uploadFile(file, path)
        results.push({ success: true, path, result })
      } catch (error) {
        results.push({ success: false, path, error })
      }
      
      completed++
      onProgress?.(completed / files.length * 100)
    }

    return results
  }

  async getFileUrl(path: string): Promise<string> {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path])
    
    if (error) throw error
  }

  async listFiles(
    folder?: string,
    options?: {
      limit?: number
      offset?: number
      sortBy?: { column: string, order: 'asc' | 'desc' }
    }
  ) {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list(folder, options)
    
    if (error) throw error
    return data
  }
}

export const fileStorage = new FileStorageManager()

export default supabase
