import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BillManagementPaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export default function BillManagementPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: BillManagementPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-card border border-border/80 rounded-2xl shadow-xs text-xs">
      {/* Left: Rows Per Page & Range Info */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">Rows per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/40 border border-border/80 text-foreground font-semibold hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              >
                <span>{pageSize}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-24 min-w-0">
              <DropdownMenuRadioGroup
                value={String(pageSize)}
                onValueChange={(val) => {
                  onPageSizeChange(Number(val))
                  onPageChange(1)
                }}
              >
                {[5, 10, 25, 50].map((size) => (
                  <DropdownMenuRadioItem key={size} value={String(size)} className="text-xs cursor-pointer">
                    {size}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span className="text-muted-foreground font-mono">
          Showing <span className="font-bold text-foreground">{startItem}</span> -{' '}
          <span className="font-bold text-foreground">{endItem}</span> of{' '}
          <span className="font-bold text-foreground">{totalItems}</span>
        </span>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-1.5 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-muted-foreground">
                  ...
                </span>
              )
            }
            const isCurrent = page === currentPage
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(Number(page))}
                className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
