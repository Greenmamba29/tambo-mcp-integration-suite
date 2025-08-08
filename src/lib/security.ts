import { supabase } from './supabase'
import { APIKeyInsert, ActivityLogInsert } from './database.types'

// Security utilities for enhanced protection
export class SecurityManager {
  private static instance: SecurityManager
  private encryptionKey: string | null = null
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  private constructor() {
    // Initialize encryption key from environment or generate
    this.encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || this.generateEncryptionKey()
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  // Generate secure encryption key
  private generateEncryptionKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Hash passwords and sensitive data
  async hashSensitiveData(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data + this.encryptionKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Encrypt sensitive data
  async encryptData(plaintext: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12))
      
      // Import key
      const keyData = encoder.encode(this.encryptionKey!.slice(0, 32))
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      )
      
      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)
      
      // Return base64 encoded
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  // Decrypt sensitive data
  async decryptData(encryptedData: string): Promise<string> {
    try {
      // Decode from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(c => c.charCodeAt(0))
      )
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)
      
      // Import key
      const encoder = new TextEncoder()
      const keyData = encoder.encode(this.encryptionKey!.slice(0, 32))
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      )
      
      // Return as string
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  // Rate limiting implementation
  checkRateLimit(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 60000
  ): boolean {
    const now = Date.now()
    const key = `${identifier}-${Math.floor(now / windowMs)}`
    
    const current = this.rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }
    
    if (now > current.resetTime) {
      // Reset window
      current.count = 0
      current.resetTime = now + windowMs
    }
    
    current.count++
    this.rateLimitMap.set(key, current)
    
    // Clean up old entries
    for (const [mapKey, value] of this.rateLimitMap.entries()) {
      if (now > value.resetTime + windowMs) {
        this.rateLimitMap.delete(mapKey)
      }
    }
    
    return current.count <= maxRequests
  }

  // Generate secure API key
  async generateAPIKey(userId: string, name: string, permissions: any): Promise<string> {
    // Generate random key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const keyString = Array.from(randomBytes, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('')
    
    // Hash for storage
    const hashedKey = await this.hashSensitiveData(keyString)
    
    // Store in database
    const { error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_hash: hashedKey,
        permissions,
        is_active: true
      })
    
    if (error) throw error
    
    // Return the unhashed key (only time it's visible)
    return `tambo_${keyString}`
  }

  // Validate API key
  async validateAPIKey(apiKey: string): Promise<{ valid: boolean; userId?: string; permissions?: any }> {
    if (!apiKey.startsWith('tambo_')) {
      return { valid: false }
    }
    
    const keyString = apiKey.replace('tambo_', '')
    const hashedKey = await this.hashSensitiveData(keyString)
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id, permissions, is_active, expires_at')
      .eq('key_hash', hashedKey)
      .single()
    
    if (error || !data || !data.is_active) {
      return { valid: false }
    }
    
    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false }
    }
    
    // Update last used
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('key_hash', hashedKey)
    
    return {
      valid: true,
      userId: data.user_id,
      permissions: data.permissions
    }
  }

  // Audit logging
  async logActivity(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: any,
    request?: Request
  ): Promise<void> {
    try {
      const logEntry: ActivityLogInsert = {
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: this.getClientIP(request),
        user_agent: request?.headers.get('user-agent') || null
      }
      
      const { error } = await supabase
        .from('activity_logs')
        .insert(logEntry)
      
      if (error) {
        console.error('Failed to log activity:', error)
      }
    } catch (error) {
      console.error('Activity logging error:', error)
    }
  }

  // Get client IP address
  private getClientIP(request?: Request): string | null {
    if (!request) return null
    
    // Try various headers for IP address
    const headers = [
      'cf-connecting-ip', // Cloudflare
      'x-real-ip',
      'x-forwarded-for',
      'x-client-ip',
      'x-forwarded',
      'forwarded-for',
      'forwarded'
    ]
    
    for (const header of headers) {
      const value = request.headers.get(header)
      if (value) {
        // Handle comma-separated IPs (take first one)
        return value.split(',')[0].trim()
      }
    }
    
    return null
  }

  // Sanitize input to prevent XSS
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"']/g, (char) => {
        switch (char) {
          case '<': return '&lt;'
          case '>': return '&gt;'
          case '"': return '&quot;'
          case "'": return '&#x27;'
          default: return char
        }
      })
  }

  // Validate file uploads
  validateFileUpload(file: File, options: {
    maxSize?: number
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}): { valid: boolean; error?: string } {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = [],
      allowedExtensions = []
    } = options

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      }
    }

    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `File extension .${extension} is not allowed`
        }
      }
    }

    // Check for potentially dangerous files
    const dangerousExtensions = [
      'exe', 'bat', 'cmd', 'scr', 'pif', 'vbs', 'js', 'jar',
      'com', 'msi', 'dll', 'scf', 'lnk', 'inf', 'reg'
    ]
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension && dangerousExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File type .${extension} is not allowed for security reasons`
      }
    }

    return { valid: true }
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Validate CSRF token
  validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken || token.length !== expectedToken.length) {
      return false
    }
    
    // Constant-time comparison to prevent timing attacks
    let result = 0
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
    }
    
    return result === 0
  }

  // Security headers for API responses
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics = new Map<string, Array<{ timestamp: number; value: number }>>()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Record performance metric
  recordMetric(name: string, value: number, userId?: string): void {
    const timestamp = Date.now()
    
    // Store in memory for immediate access
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const metricHistory = this.metrics.get(name)!
    metricHistory.push({ timestamp, value })
    
    // Keep only last 1000 measurements
    if (metricHistory.length > 1000) {
      metricHistory.shift()
    }
    
    // Store in database for persistence (async, don't wait)
    if (userId) {
      this.storeMetricInDB(userId, name, value, timestamp).catch(console.error)
    }
  }

  private async storeMetricInDB(userId: string, metricType: string, value: number, timestamp: number): Promise<void> {
    try {
      await supabase
        .from('performance_metrics')
        .insert({
          user_id: userId,
          metric_type: metricType,
          value,
          metadata: { timestamp },
          timestamp: new Date(timestamp).toISOString()
        })
    } catch (error) {
      console.error('Failed to store performance metric:', error)
    }
  }

  // Get performance statistics
  getStats(metricName: string, timeWindow: number = 300000): {
    avg: number
    min: number
    max: number
    count: number
    p95: number
    p99: number
  } | null {
    const metrics = this.metrics.get(metricName)
    if (!metrics || metrics.length === 0) {
      return null
    }

    const cutoff = Date.now() - timeWindow
    const recentMetrics = metrics
      .filter(m => m.timestamp > cutoff)
      .map(m => m.value)
      .sort((a, b) => a - b)

    if (recentMetrics.length === 0) {
      return null
    }

    const sum = recentMetrics.reduce((a, b) => a + b, 0)
    const avg = sum / recentMetrics.length
    const min = recentMetrics[0]
    const max = recentMetrics[recentMetrics.length - 1]
    
    const p95Index = Math.floor(recentMetrics.length * 0.95)
    const p99Index = Math.floor(recentMetrics.length * 0.99)
    
    return {
      avg: Math.round(avg * 100) / 100,
      min,
      max,
      count: recentMetrics.length,
      p95: recentMetrics[p95Index] || max,
      p99: recentMetrics[p99Index] || max
    }
  }

  // Performance timing wrapper
  async timeFunction<T>(
    name: string,
    fn: () => Promise<T> | T,
    userId?: string
  ): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, userId)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, userId)
      throw error
    }
  }

  // Memory usage tracking
  recordMemoryUsage(userId?: string): void {
    if (typeof window !== 'undefined' && 'memory' in (performance as any)) {
      const memory = (performance as any).memory
      this.recordMetric('memory_used', memory.usedJSHeapSize, userId)
      this.recordMetric('memory_total', memory.totalJSHeapSize, userId)
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit, userId)
    }
  }

  // Network monitoring
  recordNetworkTiming(url: string, timing: PerformanceNavigationTiming | PerformanceResourceTiming, userId?: string): void {
    if (timing.responseEnd && timing.requestStart) {
      const duration = timing.responseEnd - timing.requestStart
      this.recordMetric(`network_${url}`, duration, userId)
    }
  }
}

// Request batching utility for performance
export class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{ resolve: Function; reject: Function; params: any }>
    timer: NodeJS.Timeout
  }>()

  // Batch similar requests together
  async batchRequest<T>(
    batchKey: string,
    requestFn: (params: any[]) => Promise<T[]>,
    params: any,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let batch = this.batches.get(batchKey)
      
      if (!batch) {
        batch = {
          requests: [],
          timer: setTimeout(() => this.executeBatch(batchKey, requestFn), delay)
        }
        this.batches.set(batchKey, batch)
      }
      
      batch.requests.push({ resolve, reject, params })
    })
  }

  private async executeBatch<T>(
    batchKey: string,
    requestFn: (params: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(batchKey)
    if (!batch) return
    
    this.batches.delete(batchKey)
    
    try {
      const allParams = batch.requests.map(req => req.params)
      const results = await requestFn(allParams)
      
      // Resolve individual requests
      batch.requests.forEach((req, index) => {
        req.resolve(results[index])
      })
    } catch (error) {
      // Reject all requests
      batch.requests.forEach(req => {
        req.reject(error)
      })
    }
  }
}

// Singleton instances
export const securityManager = SecurityManager.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()
export const requestBatcher = new RequestBatcher()
