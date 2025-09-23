export const SITE_CONFIG = {
  name: "The Nightshade's Bloom",
  description: "An enchanting FFXIV venue experience",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  author: "The Nightshade's Bloom Team",
  keywords: ["FFXIV", "venue", "roleplay", "Final Fantasy XIV", "nightclub"],
}

export const ADMIN_CONFIG = {
  defaultUsername: "admin",
  defaultPassword: "admin123",
  sessionDuration: "24h",
  maxLoginAttempts: 5,
}

export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  imageBucket: "images",
}

export const PAGE_BUILDER = {
  maxElements: 50,
  elementTypes: [
    "hero",
    "text",
    "image",
    "button",
    "gallery",
    "video",
    "contact",
    "testimonial",
    "spacer",
    "divider"
    "backgroundImage"
  ],
  animations: [
    "fade-in",
    "slide-up",
    "slide-down",
    "slide-left",
    "slide-right",
    "zoom-in",
    "bounce-in"
  ]
}

export const STAFF_CONFIG = {
  maxAlts: 5,
  specialRoles: [
    "Owner",
    "Manager",
    "Key Keeper",
    "Bartender",
    "Security",
    "Entertainer",
    "Host/Hostess"
  ]
}

export const MENU_CONFIG = {
  maxCategories: 20,
  maxItemsPerCategory: 100,
  defaultCurrency: "gil"
}

export const ROUTES = {
  home: "/",
  staff: "/staff",
  menu: "/menu",
  admin: "/admin",
  login: "/admin/login"
}

export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    verify: "/api/auth/verify"
  }
}
