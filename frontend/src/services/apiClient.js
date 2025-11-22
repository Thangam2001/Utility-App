import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

export const uploadWithProgress = async ({ url, file, data = {}, onUploadProgress, responseType = 'json' }) => {
  const formData = new FormData()
  formData.append('file', file)
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  const response = await apiClient.post(url, formData, {
    onUploadProgress,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType,
  })

  return response
}


