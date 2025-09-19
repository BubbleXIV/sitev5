export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

export const validatePassword = (password, minLength = 6) => {
  if (!password) return 'Password is required'
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`
  }
  return null
}

export const validateUrl = (url, required = false) => {
  if (!url && required) return 'URL is required'
  if (url) {
    try {
      new URL(url)
    } catch {
      return 'Please enter a valid URL'
    }
  }
  return null
}

export const validateSlug = (slug) => {
  if (!slug) return 'Slug is required'
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) {
    return 'Slug can only contain lowercase letters, numbers, and hyphens'
  }
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return 'Slug cannot start or end with a hyphen'
  }
  return null
}

export const validateGilAmount = (amount) => {
  if (amount === '' || amount === null || amount === undefined) return null
  const numAmount = Number(amount)
  if (isNaN(numAmount) || numAmount < 0) {
    return 'Gil amount must be a positive number'
  }
  if (numAmount > 999999999) {
    return 'Gil amount is too large'
  }
  return null
}

export const validateImageFile = (file) => {
  if (!file) return null

  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (file.size > maxSize) {
    return 'Image file size must be less than 10MB'
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Image must be JPEG, PNG, WebP, or GIF format'
  }

  return null
}

export const validateFormData = (data, rules) => {
  const errors = {}

  Object.keys(rules).forEach(field => {
    const value = data[field]
    const fieldRules = rules[field]

    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        errors[field] = error
        break
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Staff form validation
export const validateStaffForm = (data) => {
  return validateFormData(data, {
    name: [value => validateRequired(value, 'Name')],
    role: [value => validateRequired(value, 'Role')],
    image_url: [value => validateUrl(value, false)],
    sort_order: [value => {
      if (value !== '' && value !== null && value !== undefined) {
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          return 'Sort order must be a positive number'
        }
      }
      return null
    }]
  })
}

// Menu item form validation
export const validateMenuItemForm = (data) => {
  return validateFormData(data, {
    name: [value => validateRequired(value, 'Item name')],
    category_id: [value => validateRequired(value, 'Category')],
    price_gil: [validateGilAmount],
    image_url: [value => validateUrl(value, false)]
  })
}

// Menu category form validation
export const validateMenuCategoryForm = (data) => {
  return validateFormData(data, {
    name: [value => validateRequired(value, 'Category name')]
  })
}

// Page form validation
export const validatePageForm = (data) => {
  return validateFormData(data, {
    title: [value => validateRequired(value, 'Page title')],
    slug: [value => validateRequired(value, 'Page slug'), validateSlug]
  })
}

// Admin form validation
export const validateAdminForm = (data, isEdit = false) => {
  const rules = {
    username: [value => validateRequired(value, 'Username')]
  }

  if (!isEdit || data.password) {
    rules.password = [value => validatePassword(value, 6)]
    rules.confirmPassword = [value => {
      if (value !== data.password) {
        return 'Passwords do not match'
      }
      return null
    }]
  }

  return validateFormData(data, rules)
}

// Contact form validation
export const validateContactForm = (data) => {
  return validateFormData(data, {
    name: [value => validateRequired(value, 'Name')],
    email: [validateEmail],
    message: [value => validateRequired(value, 'Message')]
  })
}