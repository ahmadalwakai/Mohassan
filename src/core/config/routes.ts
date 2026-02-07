/**
 * Route Configuration
 * Centralized route definitions and access control
 */

export const routes = {
  // Public routes
  public: {
    home: '/',
    news: '/news',
    newsArticle: (slug: string) => `/news/${slug}`,
    directory: '/directory',
    directoryCategory: (category: string, id: string) => `/directory/${category}/${id}`,
    market: '/market',
    marketItem: (type: string, id: string) => `/market/${type}/${id}`,
    community: '/community',
    initiative: (id: string) => `/initiatives/${id}`,
    ai: '/ai',
  },
  
  // Auth routes
  auth: {
    login: '/login',
    register: '/register',
    verify: '/verify',
    reset: '/reset',
  },
  
  // Account routes (requires authentication)
  account: {
    profile: '/account/profile',
    content: '/account/content',
    notifications: '/account/notifications',
    settings: '/account/settings',
  },
  
  // Moderator routes
  moderator: {
    dashboard: '/moderator',
    queue: '/moderator/queue',
    reports: '/moderator/reports',
    actions: '/moderator/actions',
  },
  
  // Admin routes
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    settings: '/admin/settings',
    audit: '/admin/audit',
    aiCenter: '/admin/ai-center',
  },
  
  // API routes
  api: {
    auth: '/api/auth',
    health: '/api/health',
    user: {
      profile: '/api/user/profile',
      notifications: '/api/user/notifications',
    },
    ai: {
      search: '/api/ai/search',
      summarize: '/api/ai/summarize',
      tag: '/api/ai/tag',
      modAssist: '/api/ai/mod-assist',
    },
    uploads: {
      sign: '/api/uploads/sign',
    },
    webhooks: {
      resend: '/api/webhooks/resend',
    },
  },
} as const;

// Route patterns for middleware matching
export const routePatterns = {
  public: [
    '/',
    '/news',
    '/news/:slug',
    '/directory',
    '/directory/:category/:id',
    '/market',
    '/market/:type/:id',
    '/community',
    '/initiatives/:id',
    '/ai',
  ],
  auth: ['/login', '/register', '/verify', '/reset'],
  account: ['/account', '/account/:path*'],
  moderator: ['/moderator', '/moderator/:path*'],
  admin: ['/admin', '/admin/:path*'],
  api: ['/api/:path*'],
} as const;

// Protected routes that require authentication
export const protectedRoutes = [
  ...routePatterns.account,
  ...routePatterns.moderator,
  ...routePatterns.admin,
];

// Routes that should redirect authenticated users
export const authRoutes = routePatterns.auth;
