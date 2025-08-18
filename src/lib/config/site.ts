export const siteConfig = {
  name: 'ASRS Fire Protection',
  domain: 'www.asrsfireprotection.com',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.asrsfireprotection.com',
  description: 'AI-powered project management and business intelligence platform',
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.asrsfireprotection.com',
    version: 'v1',
  },
  
  // CORS allowed origins
  cors: {
    allowedOrigins: [
      'https://www.asrsfireprotection.com',
      'https://asrsfireprotection.com',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3004' : '',
    ].filter(Boolean),
  },
  
  // Metadata for SEO
  metadata: {
    title: 'ASRS Fire Protection - Project Management',
    description: 'Advanced project management with AI-powered insights',
    keywords: ['project management', 'AI', 'business intelligence', 'fire protection'],
    authors: [{ name: 'ASRS Fire Protection' }],
    creator: 'ASRS Fire Protection',
    publisher: 'ASRS Fire Protection',
  },
  
  // Links
  links: {
    home: 'https://www.asrsfireprotection.com',
    dashboard: 'https://www.asrsfireprotection.com/dashboard',
    projects: 'https://www.asrsfireprotection.com/projects',
    api: 'https://www.asrsfireprotection.com/api',
  },
} as const;

export type SiteConfig = typeof siteConfig;