const API_KEY = import.meta.env.VITE_API_KEY || ''

interface ApiErrorOptions {
  message: string
  statusCode?: number
  isNetworkError?: boolean
}

class ApiError extends Error {
  statusCode?: number
  isNetworkError: boolean

  constructor(options: ApiErrorOptions) {
    super(options.message)
    this.name = 'ApiError'
    this.statusCode = options.statusCode
    this.isNetworkError = options.isNetworkError ?? false
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new ApiError({ message: error.error || `HTTP ${response.status}`, statusCode: response.status })
    }

    return response
  } catch (error) {
    if (error instanceof ApiError) throw error
    
    const isNetworkError = error instanceof TypeError && error.message.includes('Failed to fetch')
    throw new ApiError({ 
      message: isNetworkError ? 'Backend not running. Start with `make up`' : 'Network error',
      isNetworkError
    })
  }
}

export const apiClient = {
  get: (url: string) => fetchWithAuth(url),
  post: (url: string, body: unknown) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
}

export { ApiError }