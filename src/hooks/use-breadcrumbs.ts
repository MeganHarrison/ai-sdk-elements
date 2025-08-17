"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"

interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

// Route configuration for readable names
const routeConfig: Record<string, string> = {
  // Root routes
  "/": "Home",
  "/chat": "Insights",
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/protected": "Protected",
  
  // Data routes
  "/data": "Data",
  "/data/database": "Database",
  "/data/meetings": "Meetings",
  "/data/projects": "Projects",
  "/data/clients": "Clients",
  "/data/contacts": "CRM",
  "/data/prospects": "Prospects",
  "/data/estimates": "Estimates",
  
  // Auth routes
  "/auth": "Authentication",
  "/auth/login": "Login",
  "/auth/sign-up": "Sign Up",
  "/auth/forgot-password": "Forgot Password",
  "/auth/update-password": "Update Password",
  "/auth/error": "Error",
  "/auth/sign-up-success": "Sign Up Success",
}

// Special handling for dynamic segments
const dynamicSegmentHandlers: Record<string, (segment: string) => string> = {
  "/data/database": (tableName: string) => {
    // Convert table name from kebab-case to Title Case
    return tableName
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  
  return useMemo(() => {
    // Handle root path
    if (pathname === "/") {
      return [{ label: "Home", isCurrentPage: true }]
    }
    
    // Split path into segments
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Always include home
    breadcrumbs.push({ label: "Home", href: "/" })
    
    // Build breadcrumb items from path segments
    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Check if this is a dynamic segment
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"))
      const dynamicHandler = dynamicSegmentHandlers[parentPath]
      
      let label: string
      if (dynamicHandler) {
        // Use dynamic handler for this segment
        label = dynamicHandler(segment)
      } else if (routeConfig[currentPath]) {
        // Use configured label
        label = routeConfig[currentPath]
      } else {
        // Fallback: format segment name
        label = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      }
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isCurrentPage: isLast
      })
    })
    
    return breadcrumbs
  }, [pathname])
}