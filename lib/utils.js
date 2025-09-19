import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const formatGil = (amount) => {
  return new Intl.NumberFormat().format(amount) + ' gil'
}

export const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
}

// Add these to your existing lib/utils.js file

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await sleep(delay)
      return retry(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {})
}

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })
}

export const removeEmpty = (obj) => {
  return Object.entries(obj)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

// Enhanced error handling
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleError = (error, context = 'Unknown') => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service like Sentry, LogRocket, etc.
  }
}

export const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// File upload helpers
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

export const generateFileName = (originalName) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  const extension = getFileExtension(originalName)
  return `${timestamp}_${random}.${extension}`
}

export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// SEO helpers
export const generateMetadata = (page) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: `${page.title} | ${SITE_CONFIG.name}`,
    description: page.description || SITE_CONFIG.description,
    openGraph: {
      title: page.title,
      description: page.description || SITE_CONFIG.description,
      url: `${baseUrl}/${page.slug}`,
      siteName: SITE_CONFIG.name,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description || SITE_CONFIG.description
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

// Animation helpers
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Local storage helpers with error handling
export const storage = {
  get: (key, defaultValue = null) => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage:`, error)
      return defaultValue
    }
  },

  set: (key, value) => {
    if (typeof window === 'undefined') return false

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage:`, error)
      return false
    }
  },

  remove: (key) => {
    if (typeof window === 'undefined') return false

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage:`, error)
      return false
    }
  }
}