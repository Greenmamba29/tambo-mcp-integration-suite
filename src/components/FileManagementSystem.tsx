import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid3X3, 
  List, 
  Search, 
  Filter, 
  Upload, 
  Plus, 
  FolderPlus,
  Download,
  Share,
  Trash2,
  File,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  Code,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Star,
  StarOff,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  X,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from 'next-themes'
import { supabase, fileStorage, enhancedSupabase } from '@/lib/supabase'
import { FileRecord, FolderRecord, UserProfile } from '@/lib/database.types'

// Types for file management
interface FileFilter {
  searchQuery: string
  fileTypes: string[]
  dateRange: { start?: Date; end?: Date }
  categories: string[]
  sizeRange: { min?: number; max?: number }
  favorites?: boolean
  shared?: boolean
}

interface UploadProgress {
  [key: string]: {
    progress: number
    status: 'uploading' | 'completed' | 'error'
    file: File
  }
}

interface ViewSettings {
  mode: 'grid' | 'list'
  sortBy: 'name' | 'date' | 'size' | 'type'
  sortOrder: 'asc' | 'desc'
  itemsPerPage: number
  showHidden: boolean
}

const FILE_TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
  code: Code,
  default: File
}

const FILE_TYPE_COLORS = {
  image: 'text-green-600',
  video: 'text-purple-600',
  audio: 'text-blue-600',
  document: 'text-orange-600',
  archive: 'text-gray-600',
  code: 'text-pink-600',
  default: 'text-gray-500'
}

const NOTIFICATION_TYPES = {
  success: { icon: Check, className: 'bg-green-100 text-green-800 border-green-200' },
  error: { icon: X, className: 'bg-red-100 text-red-800 border-red-200' },
  info: { icon: Bell, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  warning: { icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
}

export default function FileManagementSystem() {
  // Core state
  const [files, setFiles] = useState<FileRecord[]>([])
  const [folders, setFolders] = useState<FolderRecord[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // View settings with system theme integration
  const { theme, setTheme } = useTheme()
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    mode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    itemsPerPage: 50,
    showHidden: false
  })

  // Filter state with collapsible panel
  const [filters, setFilters] = useState<FileFilter>({
    searchQuery: '',
    fileTypes: [],
    dateRange: {},
    categories: [],
    sizeRange: {},
    favorites: false,
    shared: false
  })
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  // Upload and notifications
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: keyof typeof NOTIFICATION_TYPES
    message: string
    timestamp: Date
  }>>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const { toast } = useToast()

  // User profile for theme persistence
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Load user profile and preferences
  useEffect(() => {
    loadUserProfile()
    loadFiles()
    loadFolders()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
        // Apply saved theme preference
        if (profile.theme_preference && profile.theme_preference !== theme) {
          setTheme(profile.theme_preference)
        }
        // Apply saved preferences
        if (profile.preferences) {
          const prefs = profile.preferences as any
          if (prefs.viewSettings) {
            setViewSettings(prev => ({ ...prev, ...prefs.viewSettings }))
          }
          if (prefs.notifications !== undefined) {
            setNotificationsEnabled(prefs.notifications)
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const saveUserPreferences = async (updates: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !userProfile) return

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      setUserProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error saving preferences:', error)
      showNotification('error', 'Failed to save preferences')
    }
  }

  // Theme change handler with Supabase persistence
  const handleThemeChange = useCallback(async (newTheme: string) => {
    setTheme(newTheme)
    await saveUserPreferences({ 
      theme_preference: newTheme as 'light' | 'dark' | 'system'
    })
  }, [setTheme])

  // Load files with caching
  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const cacheKey = `files-${currentFolder || 'root'}`
      const files = await enhancedSupabase.queryWithCache(
        cacheKey,
        async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return []

          const query = supabase
            .from('files')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (currentFolder) {
            query.eq('folder_id', currentFolder)
          } else {
            query.is('folder_id', null)
          }

          const { data, error } = await query
          if (error) throw error
          return data || []
        }
      )

      setFiles(files)
    } catch (error) {
      console.error('Error loading files:', error)
      showNotification('error', 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [currentFolder])

  const loadFolders = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      setFolders(data || [])
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }, [])

  // Enhanced file filtering with performance optimization
  const filteredFiles = useMemo(() => {
    let filtered = [...files]

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.mime_type.toLowerCase().includes(query)
      )
    }

    // File type filter
    if (filters.fileTypes.length > 0) {
      filtered = filtered.filter(file => {
        const type = getFileCategory(file.mime_type)
        return filters.fileTypes.includes(type)
      })
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(file => {
        const fileDate = new Date(file.created_at)
        if (filters.dateRange.start && fileDate < filters.dateRange.start) return false
        if (filters.dateRange.end && fileDate > filters.dateRange.end) return false
        return true
      })
    }

    // Size range filter
    if (filters.sizeRange.min || filters.sizeRange.max) {
      filtered = filtered.filter(file => {
        if (filters.sizeRange.min && file.size < filters.sizeRange.min) return false
        if (filters.sizeRange.max && file.size > filters.sizeRange.max) return false
        return true
      })
    }

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0
      switch (viewSettings.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'type':
          comparison = a.mime_type.localeCompare(b.mime_type)
          break
      }
      return viewSettings.sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [files, filters, viewSettings.sortBy, viewSettings.sortOrder])

  // File upload with progress tracking and auto-folder creation
  const handleFileUpload = async (uploadFiles: FileList) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showNotification('error', 'Please sign in to upload files')
      return
    }

    // Auto-create folder if it doesn't exist and we're in a folder context
    let folderId = currentFolder
    if (currentFolder && !folders.find(f => f.id === currentFolder)) {
      try {
        const folderName = `Auto-created-${Date.now()}`
        const newFolder = await createFolder(folderName, currentFolder)
        folderId = newFolder.id
        showNotification('info', `Created folder "${folderName}" for uploads`)
      } catch (error) {
        console.error('Error creating auto folder:', error)
      }
    }

    const files = Array.from(uploadFiles)
    const newUploadProgress: UploadProgress = {}

    // Initialize progress tracking
    files.forEach(file => {
      const fileId = `${file.name}-${Date.now()}-${Math.random()}`
      newUploadProgress[fileId] = {
        progress: 0,
        status: 'uploading',
        file
      }
    })

    setUploadProgress(prev => ({ ...prev, ...newUploadProgress }))
    setUploadDialogOpen(true)

    // Upload files with progress tracking
    const uploadPromises = files.map(async (file) => {
      const fileId = Object.keys(newUploadProgress).find(id => 
        newUploadProgress[id].file === file
      )!
      
      try {
        const filePath = `${user.id}/${folderId || 'root'}/${file.name}`
        
        // Upload to Supabase Storage
        const storageResult = await fileStorage.uploadFile(file, filePath)
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress: 50 }
        }))

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            user_id: user.id,
            name: file.name,
            path: filePath,
            size: file.size,
            mime_type: file.type,
            folder_id: folderId,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString()
            },
            status: 'completed'
          })

        if (dbError) throw dbError

        // Complete upload
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], progress: 100, status: 'completed' }
        }))

        return { success: true, file: file.name }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], status: 'error' }
        }))
        return { success: false, file: file.name, error }
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.length - successful

    if (successful > 0) {
      showNotification('success', `Successfully uploaded ${successful} file${successful > 1 ? 's' : ''}`)
      loadFiles() // Refresh file list
      enhancedSupabase.clearCache() // Clear cache to ensure fresh data
    }

    if (failed > 0) {
      showNotification('error', `Failed to upload ${failed} file${failed > 1 ? 's' : ''}`)
    }

    // Auto-close upload dialog after a delay
    setTimeout(() => {
      setUploadDialogOpen(false)
      setUploadProgress({})
    }, 3000)
  }

  // Create folder with auto-generation
  const createFolder = async (name: string, parentId?: string | null): Promise<FolderRecord> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const folderPath = parentId 
      ? `${folders.find(f => f.id === parentId)?.path || ''}/${name}`
      : name

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name,
        parent_id: parentId,
        path: folderPath,
        permissions: { read: true, write: true, delete: true }
      })
      .select()
      .single()

    if (error) throw error
    
    setFolders(prev => [...prev, data])
    return data
  }

  // Enhanced notification system
  const showNotification = useCallback((
    type: keyof typeof NOTIFICATION_TYPES, 
    message: string
  ) => {
    if (!notificationsEnabled) return

    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date()
    }

    setNotifications(prev => [notification, ...prev].slice(0, 10)) // Keep last 10

    // Show toast with glow effect
    const NotificationIcon = NOTIFICATION_TYPES[type].icon
    toast({
      title: (
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-full ${
            type === 'success' ? 'bg-green-500 shadow-green-500/50' :
            type === 'error' ? 'bg-red-500 shadow-red-500/50' :
            type === 'warning' ? 'bg-yellow-500 shadow-yellow-500/50' :
            'bg-blue-500 shadow-blue-500/50'
          } shadow-lg animate-pulse`}>
            <NotificationIcon className="h-3 w-3 text-white" />
          </div>
          <span className="capitalize">{type}</span>
        </div>
      ),
      description: message,
      className: NOTIFICATION_TYPES[type].className
    })

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }, [notificationsEnabled, toast])

  // Utility functions
  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('text/') || mimeType.includes('document')) return 'document'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive'
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) return 'code'
    return 'default'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // File operations
  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return

    try {
      const filesToDelete = Array.from(selectedFiles)
      
      // Delete from storage
      await Promise.all(
        filesToDelete.map(async (fileId) => {
          const file = files.find(f => f.id === fileId)
          if (file) {
            await fileStorage.deleteFile(file.path)
          }
        })
      )

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .in('id', filesToDelete)

      if (error) throw error

      showNotification('success', `Deleted ${filesToDelete.length} file${filesToDelete.length > 1 ? 's' : ''}`)
      setSelectedFiles(new Set())
      loadFiles()
      enhancedSupabase.clearCache()
    } catch (error) {
      console.error('Error deleting files:', error)
      showNotification('error', 'Failed to delete files')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header with notifications and quick upload */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur-sm transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Files in a Snap
              </h1>
              <Badge variant="outline" className="text-xs">
                Enhanced File Management System
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`transition-all duration-300 ${
                  notificationsEnabled 
                    ? 'text-blue-600 hover:bg-blue-50 shadow-blue-500/20 shadow-md' 
                    : 'text-gray-400'
                }`}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>

              {/* Quick Upload Button with Glow Effect */}
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className={`transition-all duration-300 transform hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/50'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                    } shadow-lg font-medium`}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Quick Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Files
                    </DialogTitle>
                    <DialogDescription>
                      Drag and drop files here or click to browse. Folders will be auto-created if needed.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                      onDrop={(e) => {
                        e.preventDefault()
                        const files = e.dataTransfer.files
                        if (files.length > 0) {
                          handleFileUpload(files)
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">Drop files here</p>
                      <p className="text-sm text-gray-500 mb-4">
                        or click to select files
                      </p>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileUpload(e.target.files)
                          }
                        }}
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-300"
                      >
                        Browse Files
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Upload Progress</h4>
                        {Object.entries(uploadProgress).map(([id, progress]) => (
                          <div key={id} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  {progress.file.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {progress.progress}%
                                </span>
                              </div>
                              <Progress 
                                value={progress.progress} 
                                className={`h-2 transition-all duration-300 ${
                                  progress.status === 'completed' ? 'bg-green-100' :
                                  progress.status === 'error' ? 'bg-red-100' :
                                  'bg-blue-100'
                                }`}
                              />
                            </div>
                            <div className="flex items-center">
                              {progress.status === 'completed' && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                              {progress.status === 'error' && (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              {progress.status === 'uploading' && (
                                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Theme Toggle */}
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Collapsible Sticky Filter Panel */}
          <div className={`sticky top-24 h-fit transition-all duration-300 ${
            filterPanelOpen ? 'w-80' : 'w-12'
          }`}>
            <Card className={`transition-all duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <Collapsible open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 hover:bg-transparent"
                  >
                    <Filter className="h-4 w-4" />
                    {filterPanelOpen && <span className="ml-2">Filters</span>}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-4 space-y-4 border-t">
                    {/* Search Bar */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Search Files</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Search files..."
                          value={filters.searchQuery}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            searchQuery: e.target.value
                          }))}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* File Types */}
                    <div className="space-y-2">
                      <Label>File Types</Label>
                      <div className="space-y-1">
                        {['image', 'video', 'audio', 'document', 'archive', 'code'].map(type => (
                          <Label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.fileTypes.includes(type)}
                              onChange={(e) => {
                                setFilters(prev => ({
                                  ...prev,
                                  fileTypes: e.target.checked
                                    ? [...prev.fileTypes, type]
                                    : prev.fileTypes.filter(t => t !== type)
                                }))
                              }}
                              className="rounded"
                            />
                            <span className="capitalize text-sm">{type}</span>
                          </Label>
                        ))}
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="space-y-2">
                      <Label>Quick Filters</Label>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={filters.favorites}
                            onCheckedChange={(checked) => 
                              setFilters(prev => ({ ...prev, favorites: checked }))
                            }
                          />
                          <span className="text-sm">Favorites only</span>
                        </Label>
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={filters.shared}
                            onCheckedChange={(checked) => 
                              setFilters(prev => ({ ...prev, shared: checked }))
                            }
                          />
                          <span className="text-sm">Shared files</span>
                        </Label>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        searchQuery: '',
                        fileTypes: [],
                        dateRange: {},
                        categories: [],
                        sizeRange: {},
                        favorites: false,
                        shared: false
                      })}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-4">
            {/* Toolbar */}
            <Card className={`p-4 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Button
                      variant={viewSettings.mode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewSettings(prev => ({ ...prev, mode: 'grid' }))}
                      className="px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewSettings.mode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewSettings(prev => ({ ...prev, mode: 'list' }))}
                      className="px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Options */}
                  <Select
                    value={viewSettings.sortBy}
                    onValueChange={(value: any) => 
                      setViewSettings(prev => ({ ...prev, sortBy: value }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewSettings(prev => ({
                      ...prev,
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                    }))}
                  >
                    {viewSettings.sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedFiles.size > 0 && (
                    <>
                      <Badge variant="secondary">
                        {selectedFiles.size} selected
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteSelectedFiles}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadFiles()
                      enhancedSupabase.clearCache()
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Files Display */}
            <div className={`transition-all duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {viewSettings.mode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredFiles.map(file => {
                    const category = getFileCategory(file.mime_type)
                    const IconComponent = FILE_TYPE_ICONS[category as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default
                    const isSelected = selectedFiles.has(file.id)
                    
                    return (
                      <motion.div
                        key={file.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] ${
                            isSelected 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : theme === 'dark' 
                                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            const newSelected = new Set(selectedFiles)
                            if (isSelected) {
                              newSelected.delete(file.id)
                            } else {
                              newSelected.add(file.id)
                            }
                            setSelectedFiles(newSelected)
                          }}
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className={`p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`h-8 w-8 ${
                                FILE_TYPE_COLORS[category as keyof typeof FILE_TYPE_COLORS] || FILE_TYPE_COLORS.default
                              }`} />
                            </div>
                            <div className="w-full">
                              <p className="font-medium text-sm truncate" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(file.created_at)}
                              </p>
                            </div>
                            {file.status === 'processing' && (
                              <div className="w-full">
                                <Progress value={file.upload_progress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <Card className={`transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredFiles.map(file => {
                      const category = getFileCategory(file.mime_type)
                      const IconComponent = FILE_TYPE_ICONS[category as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default
                      const isSelected = selectedFiles.has(file.id)
                      
                      return (
                        <motion.div
                          key={file.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`p-4 flex items-center gap-4 cursor-pointer transition-colors duration-200 ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            const newSelected = new Set(selectedFiles)
                            if (isSelected) {
                              newSelected.delete(file.id)
                            } else {
                              newSelected.add(file.id)
                            }
                            setSelectedFiles(newSelected)
                          }}
                        >
                          <div className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              FILE_TYPE_COLORS[category as keyof typeof FILE_TYPE_COLORS] || FILE_TYPE_COLORS.default
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)} • {formatDate(file.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.status === 'processing' && (
                              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </div>

            {filteredFiles.length === 0 && !loading && (
              <div className="text-center py-12">
                <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No files found
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {filters.searchQuery || filters.fileTypes.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Upload some files to get started'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
