"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

interface BreadcrumbNavProps {
  className?: string
  maxItems?: number
}

export function BreadcrumbNav({ className, maxItems = 4 }: BreadcrumbNavProps) {
  const items = useBreadcrumbs()
  
  // Handle responsive breadcrumbs with ellipsis
  const shouldCollapse = items.length > maxItems
  const visibleItems = shouldCollapse 
    ? [items[0], ...items.slice(-(maxItems - 2))]
    : items
  const collapsedItems = shouldCollapse 
    ? items.slice(1, items.length - (maxItems - 2))
    : []

  return (
    <Breadcrumb className={cn("flex", className)}>
      <BreadcrumbList>
        {/* First item (usually Home) */}
        <BreadcrumbItem>
          {visibleItems[0].href ? (
            <BreadcrumbLink asChild>
              <Link 
                href={visibleItems[0].href}
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                {visibleItems[0].label === "Home" && (
                  <Home className="h-3.5 w-3.5" />
                )}
                <span className={cn(
                  visibleItems[0].label === "Home" && "sr-only sm:not-sr-only"
                )}>
                  {visibleItems[0].label}
                </span>
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="flex items-center gap-1.5">
              {visibleItems[0].label === "Home" && (
                <Home className="h-3.5 w-3.5" />
              )}
              {visibleItems[0].label}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Collapsed items dropdown */}
        {shouldCollapse && collapsedItems.length > 0 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {collapsedItems.map((item, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link href={item.href!}>
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {/* Visible items */}
        {visibleItems.slice(1).map((item, index) => (
          <React.Fragment key={index + 1}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link 
                    href={item.href}
                    className="max-w-20 truncate md:max-w-none"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}