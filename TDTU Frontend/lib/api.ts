// This file contains all API endpoints that need to be connected to the backend
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Helper function for API calls using axios
async function apiCall<T>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<{ success: boolean; data: T; message?: string }>({
      url: endpoint,
      ...config,
    })
    
    // Handle 204 No Content (DELETE requests)
    if (response.status === 204) {
      return { success: true, data: undefined as T }
    }
    
    // Backend already returns { success, data } format - extract it properly
    const backendResponse = response.data
    if (backendResponse && backendResponse.success !== undefined) {
      if (backendResponse.success) {
        return { success: true, data: backendResponse.data }
      } else {
        return { success: false, error: backendResponse.message || 'Unknown error' }
      }
    }
    
    // Fallback for responses without success field
    return { success: true, data: response.data as T }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Network error'
      return { success: false, error: message }
    }
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
      data: { initData },
      headers,
    })
  },

  // Development-only login (works only when backend is in dev mode)
  devLogin: async (telegramUserId: string, firstName?: string, lastName?: string): Promise<ApiResponse<{ accessToken: string; user: any }>> => {
    return apiCall('/api/v1/auth/dev-login', {
      method: 'POST',
      data: {
        telegramUserId,
        firstName: firstName || 'Dev',
        lastName: lastName || 'Admin',
        username: 'dev_admin',
        languageCode: 'uz',
      },
    })
  },

  // Get user profile (current user)
  getProfile: async (
    token: string,
  ): Promise<ApiResponse<{ id: string; telegramUserId: string; firstName: string; lastName: string; course?: number; major?: string; age?: number; language: string; role: string }>> => {
    return apiCall('/api/v1/me', {
      method: 'GET',
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
      data: profile,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

// News API
export const newsApi = {
  // Get all news (public)
  getAll: async (params?: { mediaType?: string; search?: string; limit?: number; page?: number }): Promise<
    ApiResponse<any>
  > => {
    return apiCall('/api/v1/news', {
      method: 'GET',
      params: {
        mediaType: params?.mediaType,
        search: params?.search,
        limit: params?.limit,
        page: params?.page,
      },
    })
  },

  // Get all news for admin (with full data including all language fields)
  getAllAdmin: async (token: string, params?: { limit?: number; page?: number }): Promise<
    ApiResponse<any>
  > => {
    return apiCall('/api/v1/admin/news', {
      method: 'GET',
      params: {
        limit: params?.limit,
        page: params?.page,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
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
    return apiCall(`/api/v1/news/${id}`, {
      method: 'GET',
    })
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
      data: news,
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
      data: news,
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
  // Get all contacts (public)
  getAll: async (params?: { search?: string; status?: string }): Promise<
    ApiResponse<
      Array<{
        id: string
        fullName: string
        telegramId?: string
        telegramUserId?: string
        position: string | Record<string, string> | null
        department: string | Record<string, string> | null
        description: string | Record<string, string> | null
        photoUrl?: string
        email?: string
        phone?: string
        status: string
      }>
    >
  > => {
    return apiCall('/api/v1/contacts', {
      method: 'GET',
      params: {
        search: params?.search,
        status: params?.status,
      },
    })
  },

  // Get all contacts for admin (full data)
  getAllAdmin: async (token: string): Promise<ApiResponse<any>> => {
    return apiCall('/api/v1/admin/contacts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Get single contact
  getById: async (
    id: string,
  ): Promise<
    ApiResponse<{
      id: string
      fullName: string
      telegramId?: string
      telegramUserId?: string
      position: string | Record<string, string> | null
      department: string | Record<string, string> | null
      description: string | Record<string, string> | null
      photoUrl?: string
      email?: string
      phone?: string
      status: string
    }>
  > => {
    return apiCall(`/api/v1/contacts/${id}`, {
      method: 'GET',
    })
  },

  // Create contact (admin only)
  create: async (token: string, contact: {
    fullName: string
    telegramId?: string
    telegramUserId?: string
    position?: string
    department?: string
    description?: string
    photoUrl?: string
    email?: string
    phone?: string
  }): Promise<ApiResponse<{ id: string }>> => {
    return apiCall('/api/v1/admin/contacts', {
      method: 'POST',
      data: contact,
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
      data: contact,
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
      totalMessages: number
      messagesToday: number
      broadcastSuccess: number
      broadcastFailure: number
    }>
  > => {
    return apiCall('/api/v1/admin/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Get activity logs
  getActivityLogs: async (token: string, params?: { limit?: number; offset?: number }): Promise<
    ApiResponse<{
      data: Array<{
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
      total: number
      limit: number
      offset: number
    }>
  > => {
    return apiCall('/api/v1/admin/activity', {
      method: 'GET',
      params: {
        limit: params?.limit,
        offset: params?.offset,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Send broadcast message
  sendBroadcast: async (token: string, data: {
    message: string
    mediaUrls?: string[]
  }): Promise<ApiResponse<{ id: string; status: string }>> => {
    return apiCall('/api/v1/admin/broadcast', {
      method: 'POST',
      data: data,
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
      method: 'GET',
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
      
      const response = await axios.post('/api/cloudinary', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return { success: true, data: { url: response.data.url, publicId: response.data.publicId } }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: `Upload failed: ${error.response?.status || error.message}` }
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    }
  },

  // Delete media from Cloudinary
  deleteMedia: async (publicId: string): Promise<ApiResponse<boolean>> => {
    try {
      await axios.delete('/api/cloudinary', {
        data: { publicId },
      })
      
      return { success: true, data: true }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: `Delete failed: ${error.response?.status || error.message}` }
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      }
    }
  },
}
