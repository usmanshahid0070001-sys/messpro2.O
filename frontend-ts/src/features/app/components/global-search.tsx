"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  CornerDownLeft,
  Compass,
} from "lucide-react"
import { usePageSearch } from "@/features/app/hooks/usePageSearch"
import { useNavigation } from "@/hooks/useNavigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface GlobalSearchProps {
  targetContainerId?: string
  className?: string
}

export function GlobalSearch({
  targetContainerId = "main-page-content",
  className = "",
}: GlobalSearchProps) {
  const navigate = useNavigate()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const {
    isOpen,
    query,
    setQuery,
    totalMatches,
    activeIndex,
    nextMatch,
    prevMatch,
    clearSearch,
    closeSearch,
    openSearch,
  } = usePageSearch(targetContainerId)

  const { navMain } = useNavigation()

  // Flatten navigation links for quick-jump suggestions
  const flattenedNavItems = React.useMemo(() => {
    const list: { title: string; url: string; icon?: React.ElementType; section?: string }[] = []
    navMain.forEach((group) => {
      if (group.items && group.items.length > 0) {
        group.items.forEach((subItem: any) => {
          list.push({
            title: subItem.title,
            url: subItem.url,
            icon: group.icon,
            section: group.title,
          })
        })
      } else {
        list.push({
          title: group.title,
          url: group.url,
          icon: group.icon,
        })
      }
    })
    return list
  }, [navMain])

  // Filter navigation items matching the query
  const matchingNavItems = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return flattenedNavItems.filter(
      (item) =>
        item.url !== "#" &&
        (item.title.toLowerCase().includes(q) ||
          (item.section && item.section.toLowerCase().includes(q)))
    )
  }, [flattenedNavItems, query])

  // Auto-focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Click outside to close search (if empty)
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (!query.trim()) {
          closeSearch()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, query, closeSearch])

  // Keyboard navigation inside input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (e.shiftKey) {
        prevMatch()
      } else {
        nextMatch()
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      nextMatch()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      prevMatch()
    } else if (e.key === "Escape") {
      e.preventDefault()
      closeSearch()
    }
  }

  const isMac = typeof window !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0
  const shortcutKey = isMac ? "⌘K" : "Ctrl+K"

  return (
    <div
      ref={containerRef}
      data-no-search="true"
      className={`relative flex items-center ${className}`}
    >
      {!isOpen ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search in page"
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-input/60 bg-muted/40 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Search page...</span>
              <kbd className="pointer-events-none hidden h-4 select-none items-center gap-0.5 rounded border border-border/80 bg-background px-1 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                {shortcutKey}
              </kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Search text on this page or navigate ({shortcutKey})</span>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div className="relative flex items-center animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="relative flex items-center w-72 sm:w-96 rounded-lg border border-ring/60 bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30 transition-all">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search text on page or navigate..."
              className="h-8 w-full bg-transparent pl-8 pr-24 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
            />

            {/* Match Counter & Match Navigation */}
            <div className="absolute right-1.5 flex items-center gap-1">
              {query.trim().length > 0 && (
                <div className="flex items-center gap-0.5">
                  <span
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                      totalMatches > 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {totalMatches > 0 ? `${activeIndex + 1}/${totalMatches}` : "0"}
                  </span>

                  {totalMatches > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={prevMatch}
                        title="Previous match (Shift+Enter or ↑)"
                        className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={nextMatch}
                        title="Next match (Enter or ↓)"
                        className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={clearSearch}
                    title="Clear search"
                    className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={closeSearch}
                title="Close search (Esc)"
                className="h-6 px-1.5 inline-flex items-center justify-center rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/50 ml-0.5"
              >
                Esc
              </button>
            </div>
          </div>

          {/* Quick-Jump Dropdown suggestions when query matches pages or has active page matches */}
          {query.trim().length > 0 && (matchingNavItems.length > 0 || totalMatches > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 slide-in-from-top-1 duration-150">
              {/* In-page summary bar */}
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {totalMatches > 0
                    ? `Found ${totalMatches} in-page text ${totalMatches === 1 ? "match" : "matches"}`
                    : "No text matches on current page view"}
                </span>
                {totalMatches > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    Press <kbd className="font-mono font-semibold text-foreground">Enter</kbd> to jump
                  </span>
                )}
              </div>

              {/* Navigation Quick Links */}
              {matchingNavItems.length > 0 && (
                <div className="p-1.5">
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Compass className="h-3 w-3" />
                    <span>Navigate To</span>
                  </div>
                  <div className="space-y-0.5">
                    {matchingNavItems.map((item) => (
                      <button
                        key={`${item.section || ""}-${item.title}-${item.url}`}
                        type="button"
                        onClick={() => {
                          closeSearch()
                          navigate(item.url)
                        }}
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2">
                          {item.icon ? (
                            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span className="font-medium text-foreground">{item.title}</span>
                          {item.section && (
                            <span className="text-[10px] text-muted-foreground">
                              in {item.section}
                            </span>
                          )}
                        </div>
                        <CornerDownLeft className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
