const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    return await response.json()
  } catch (error) {
    console.error('[API] Request failed:', error)
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    }
  }
}

export async function uploadFile(
  endpoint: string,
  file: File
): Promise<ApiResponse<{ filename: string }>> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    })
    return await response.json()
  } catch (error) {
    console.error('[API] Upload failed:', error)
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload file',
      },
    }
  }
}
