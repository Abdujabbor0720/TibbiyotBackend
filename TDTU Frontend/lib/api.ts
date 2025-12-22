// This file contains all API endpoints that need to be connected to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || `HTTP error! status: ${response.status}` 
      }
    }
    
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('API Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    }
  }
}

// User/Auth API
export const userApi = {
  // Validate Telegram user and get session
  validateTelegramUser: async (initData: string, token?: string): Promise<ApiResponse<{ user: any; token: string; isAdmin: boolean }>> => {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return apiCall('/api/v1/auth/telegram-webapp', {
      method: 'POST',
      body: JSON.stringify({ initData }),
      headers,
    })
  },

  // Get user profile (current user)
  getProfile: async (
    token: string,
  ): Promise<ApiResponse<{ id: string; telegramUserId: string; firstName: string; lastName: string; course?: number; major?: string; age?: number; language: string; role: string }>> => {
    return apiCall('/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Update user profile (current user)
  updateProfile: async (
    token: string,
    profile: { firstName?: string; lastName?: string; course?: number; major?: string; age?: number; language?: string },
  ): Promise<ApiResponse<any>> => {
    return apiCall('/api/v1/me', {
      method: 'PATCH',
      body: JSON.stringify(profile),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

// News API
export const newsApi = {
  // Get all news
  getAll: async (params?: { mediaType?: string; search?: string; limit?: number; offset?: number }): Promise<
    ApiResponse<
      Array<{
        id: string
        title: Record<string, string>
        excerpt: Record<string, string>
        body: Record<string, string>
        mediaType: string
        mediaUrls?: string[]
        publishedAt: string
      }>
    >
  > => {
    const queryParams = new URLSearchParams()
    if (params?.mediaType) queryParams.append('mediaType', params.mediaType)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const queryString = queryParams.toString()
    return apiCall(`/api/v1/news${queryString ? `?${queryString}` : ''}`)
  },

  // Get single news item
  getById: async (
    id: string,
  ): Promise<
    ApiResponse<{
      id: string
      title: Record<string, string>
      excerpt: Record<string, string>
      body: Record<string, string>
      mediaType: string
      mediaUrls?: string[]
      publishedAt: string
    }>
  > => {
    return apiCall(`/api/v1/news/${id}`)
  },

  // Create news (admin only)
  create: async (token: string, news: {
    title: Record<string, string>
    body: Record<string, string>
    mediaType: string
    mediaUrls?: string[]
  }): Promise<ApiResponse<{ id: string }>> => {
    return apiCall('/api/v1/admin/news', {
      method: 'POST',
      body: JSON.stringify(news),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Update news (admin only)
  update: async (
    token: string,
    id: string,
    news: {
      title?: Record<string, string>
      body?: Record<string, string>
      mediaType?: string
      mediaUrls?: string[]
    },
  ): Promise<ApiResponse<boolean>> => {
    return apiCall(`/api/v1/admin/news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(news),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Delete news (admin only)
  delete: async (token: string, id: string): Promise<ApiResponse<boolean>> => {
    return apiCall(`/api/v1/admin/news/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

// Contacts API
export const contactsApi = {
  // Get all contacts
  getAll: async (params?: { search?: string; status?: string }): Promise<
    ApiResponse<
      Array<{
        id: string
        fullName: string
        telegramId: string
        position: Record<string, string>
        department: Record<string, string>
        description: Record<string, string>
        photoUrl?: string
        email?: string
        phone?: string
        status: string
      }>
    >
  > => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    
    const queryString = queryParams.toString()
    return apiCall(`/api/v1/contacts${queryString ? `?${queryString}` : ''}`)
  },

  // Get single contact
  getById: async (
    id: string,
  ): Promise<
    ApiResponse<{
      id: string
      fullName: string
      telegramId: string
      position: Record<string, string>
      department: Record<string, string>
      description: Record<string, string>
      photoUrl?: string
      email?: string
      phone?: string
      status: string
    }>
  > => {
    return apiCall(`/api/v1/contacts/${id}`)
  },

  // Create contact (admin only)
  create: async (token: string, contact: {
    fullName: string
    telegramId: string
    position: Record<string, string>
    department: Record<string, string>
    description: Record<string, string>
    photoUrl?: string
    email?: string
    phone?: string
  }): Promise<ApiResponse<{ id: string }>> => {
    return apiCall('/api/v1/admin/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Update contact (admin only)
  update: async (
    token: string,
    id: string,
    contact: {
      fullName?: string
      telegramId?: string
      position?: Record<string, string>
      department?: Record<string, string>
      description?: Record<string, string>
      photoUrl?: string
      email?: string
      phone?: string
      status?: string
    },
  ): Promise<ApiResponse<boolean>> => {
    return apiCall(`/api/v1/admin/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(contact),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Delete contact (admin only)
  delete: async (token: string, id: string): Promise<ApiResponse<boolean>> => {
    return apiCall(`/api/v1/admin/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

// Admin API
export const adminApi = {
  // Get dashboard stats
  getStats: async (token: string): Promise<
    ApiResponse<{
      totalUsers: number
      totalContacts: number
      totalNews: number
      totalBroadcasts: number
    }>
  > => {
    return apiCall('/api/v1/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Get activity logs
  getActivityLogs: async (token: string, params?: { limit?: number; offset?: number }): Promise<
    ApiResponse<
      Array<{
        id: string
        action: string
        entityType: string
        entityId: string
        details: any
        createdAt: string
        user?: {
          id: string
          firstName: string
          lastName: string
        }
      }>
    >
  > => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const queryString = queryParams.toString()
    return apiCall(`/api/v1/admin/activity${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Send broadcast message
  sendBroadcast: async (token: string, message: {
    title: Record<string, string>
    body: Record<string, string>
  }): Promise<ApiResponse<{ id: string; status: string }>> => {
    return apiCall('/api/v1/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Get all broadcasts
  getBroadcasts: async (token: string): Promise<
    ApiResponse<
      Array<{
        id: string
        message: Record<string, string>
        status: string
        totalRecipients: number
        sentCount: number
        createdAt: string
      }>
    >
  > => {
    return apiCall('/api/v1/admin/broadcast', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

// File upload API - Cloudinary
export const uploadApi = {
  // Upload media file to Cloudinary
  uploadMedia: async (file: File): Promise<ApiResponse<{ url: string; publicId: string }>> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        return { success: false, error: `Upload failed: ${response.status}` }
      }
      
      const data = await response.json()
      return { success: true, data: { url: data.url, publicId: data.publicId } }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    }
  },

  // Delete media from Cloudinary
  deleteMedia: async (publicId: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      })
      
      if (!response.ok) {
        return { success: false, error: `Delete failed: ${response.status}` }
      }
      
      return { success: true, data: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      }
    }
  },
}
