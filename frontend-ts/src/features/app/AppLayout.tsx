import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "@/features/app/components/app-sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Bell } from "lucide-react"
import { GlobalSearch } from "@/features/app/components/global-search"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useNavigation } from "@/hooks/useNavigation"
import { useSEO } from "@/hooks/useSEO"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import logoUrl from "@/assets/pwa-512x512.png"

export default function AppLayout() {
  const location = useLocation()
  const { navMain } = useNavigation()

  // Resolve breadcrumbs dynamically based on active route and navigation items
  const breadcrumbs = React.useMemo(() => {
    const pathname = location.pathname

    for (const group of navMain) {
      if (group.items && group.items.length > 0) {
        for (const item of group.items) {
          if (
            item.url !== "#" &&
            (pathname === item.url || (item.url !== "/app" && pathname.startsWith(item.url)))
          ) {
            return {
              parent: group.title,
              current: item.title,
            }
          }
        }
      } else if (group.url && group.url !== "#") {
        if (
          pathname === group.url ||
          (group.url !== "/app" && pathname.startsWith(group.url))
        ) {
          return {
            parent: null,
            current: group.title,
          }
        }
      }
    }

    // Default for /app
    if (pathname === "/app" || pathname === "/app/") {
      return {
        parent: "System Overview",
        current: "Dashboard",
      }
    }

    // Fallback: format URL path segments
    const cleanPath = pathname.replace(/^\/app\/?/, "")
    const segments = cleanPath.split("/").filter(Boolean)

    const formatSegment = (text: string) =>
      text
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

    if (segments.length === 0) {
      return { parent: null, current: "Dashboard" }
    }

    if (segments.length === 1) {
      return { parent: null, current: formatSegment(segments[0]) }
    }

    return {
      parent: formatSegment(segments[0]),
      current: formatSegment(segments.slice(1).join(" ")),
    }
  }, [location.pathname, navMain])

  // Ensure internal authenticated dashboard routes are protected from search indexing
  useSEO({
    title: `${breadcrumbs.current} — MessPro 2.0`,
    description: 'MessPro 2.0 Authenticated Portal',
    robots: 'noindex, nofollow',
  })

  return (
    <SidebarProvider>
      <AppSidebar side="left" variant="sidebar" collapsible="icon" />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-w-0 max-w-full">
        <div className="flex items-center justify-between h-12 w-full sticky top-0 z-30 bg-background/95 backdrop-blur-xs border-b border-border/40 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1" />

            {/* Mobile / Small screen: Logo & Brand Name */}
            <div className="flex items-center gap-2 md:hidden">
              <img
                src={logoUrl}
                alt="MessPro Logo"
                className="h-6 w-6 rounded-md object-contain"
              />
              <span className="font-semibold text-sm tracking-tight text-foreground">
                MessPro
              </span>
            </div>

            {/* Medium & Larger screens: Page Heading / Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.parent && (
                    <>
                      <BreadcrumbItem className="text-muted-foreground font-normal">
                        {breadcrumbs.parent}
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium text-foreground truncate">
                      {breadcrumbs.current}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <GlobalSearch targetContainerId="main-page-content" />
            <button
              type="button"
              aria-label="Notifications"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div id="main-page-content" className="flex-1 min-w-0 max-w-full overflow-x-hidden">
          {/* Main content — Dashboard, All Hostels, etc. protected by ErrorBoundary */}
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </SidebarProvider>
  )
}