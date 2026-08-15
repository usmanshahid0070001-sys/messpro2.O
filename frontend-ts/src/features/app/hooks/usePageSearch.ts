import { useState, useEffect, useCallback, useRef } from "react"

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const HIGHLIGHT_CLASS = "page-search-mark"
const ACTIVE_HIGHLIGHT_CLASS = "page-search-mark-active"

export function usePageSearch(targetContainerId: string = "main-page-content") {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [totalMatches, setTotalMatches] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const matchElementsRef = useRef<HTMLElement[]>([])
  const activeIndexRef = useRef(0)
  activeIndexRef.current = activeIndex

  // Helper to remove all search highlight marks from the DOM
  const removeHighlights = useCallback(() => {
    const container = document.getElementById(targetContainerId) || document.body
    const marks = container.querySelectorAll(`mark.${HIGHLIGHT_CLASS}`)

    marks.forEach((mark) => {
      const parent = mark.parentNode
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark)
        }
        parent.removeChild(mark)
      }
    })

    // Normalize text nodes so they join back together
    container.normalize()
    matchElementsRef.current = []
    setTotalMatches(0)
    setActiveIndex(0)
  }, [targetContainerId])

  // Helper to update visual styling on active match and scroll to it
  const updateActiveHighlight = useCallback((index: number) => {
    const matches = matchElementsRef.current
    if (matches.length === 0) return

    matches.forEach((el, i) => {
      if (i === index) {
        el.classList.add(ACTIVE_HIGHLIGHT_CLASS)
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
      } else {
        el.classList.remove(ACTIVE_HIGHLIGHT_CLASS)
      }
    })
  }, [])

  // Apply search highlights across visible text in container
  const applyHighlights = useCallback(
    (searchQuery: string) => {
      removeHighlights()

      const trimmed = searchQuery.trim()
      if (!trimmed || trimmed.length === 0) {
        return
      }

      const container = document.getElementById(targetContainerId) || document.body
      const regex = new RegExp(`(${escapeRegExp(trimmed)})`, "gi")
      const matches: HTMLElement[] = []

      // TreeWalker to traverse only text nodes
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) {
              return NodeFilter.FILTER_REJECT
            }
            const parent = node.parentElement
            if (!parent) return NodeFilter.FILTER_REJECT

            // Skip script, style, input elements, or anything marked data-no-search
            const tag = parent.tagName.toLowerCase()
            if (
              ["script", "style", "noscript", "template", "textarea", "input", "select"].includes(tag) ||
              parent.closest("[data-no-search]")
            ) {
              return NodeFilter.FILTER_REJECT
            }

            return NodeFilter.FILTER_ACCEPT
          },
        }
      )

      const textNodes: Text[] = []
      let currentNode = walker.nextNode()
      while (currentNode) {
        textNodes.push(currentNode as Text)
        currentNode = walker.nextNode()
      }

      let matchCount = 0
      for (const textNode of textNodes) {
        const text = textNode.nodeValue
        if (!text || !regex.test(text)) continue

        regex.lastIndex = 0
        const fragment = document.createDocumentFragment()
        let lastIdx = 0
        let match: RegExpExecArray | null

        while ((match = regex.exec(text)) !== null) {
          if (match.index > lastIdx) {
            fragment.appendChild(document.createTextNode(text.slice(lastIdx, match.index)))
          }

          const mark = document.createElement("mark")
          mark.className = HIGHLIGHT_CLASS
          mark.dataset.searchIndex = String(matchCount)
          mark.textContent = match[0]

          fragment.appendChild(mark)
          matches.push(mark)
          matchCount++

          lastIdx = regex.lastIndex
        }

        if (lastIdx < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIdx)))
        }

        if (textNode.parentNode) {
          textNode.parentNode.replaceChild(fragment, textNode)
        }
      }

      matchElementsRef.current = matches
      setTotalMatches(matches.length)
      setActiveIndex(0)

      if (matches.length > 0) {
        updateActiveHighlight(0)
      }
    },
    [targetContainerId, removeHighlights, updateActiveHighlight]
  )

  // Trigger search on query change
  useEffect(() => {
    if (!isOpen) {
      removeHighlights()
      return
    }

    const timer = setTimeout(() => {
      applyHighlights(query)
    }, 80) // Fast debounce for instant feeling search

    return () => clearTimeout(timer)
  }, [query, isOpen, applyHighlights, removeHighlights])

  // Move to next match
  const nextMatch = useCallback(() => {
    if (matchElementsRef.current.length === 0) return
    const nextIdx = (activeIndexRef.current + 1) % matchElementsRef.current.length
    setActiveIndex(nextIdx)
    updateActiveHighlight(nextIdx)
  }, [updateActiveHighlight])

  // Move to previous match
  const prevMatch = useCallback(() => {
    if (matchElementsRef.current.length === 0) return
    const prevIdx =
      (activeIndexRef.current - 1 + matchElementsRef.current.length) %
      matchElementsRef.current.length
    setActiveIndex(prevIdx)
    updateActiveHighlight(prevIdx)
  }, [updateActiveHighlight])

  const clearSearch = useCallback(() => {
    setQuery("")
    removeHighlights()
  }, [removeHighlights])

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    removeHighlights()
  }, [removeHighlights])

  const openSearch = useCallback(() => {
    setIsOpen(true)
  }, [])

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        removeHighlights()
        setQuery("")
        return false
      }
      return true
    })
  }, [removeHighlights])

  // Global Keyboard shortcuts (Ctrl+K, Cmd+K, /, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        toggleSearch()
        return
      }

      // Quick open on '/' when not in input/textarea
      if (e.key === "/" && !isOpen) {
        const target = e.target as HTMLElement
        const isInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        if (!isInput) {
          e.preventDefault()
          openSearch()
          return
        }
      }

      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault()
        closeSearch()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, toggleSearch, openSearch, closeSearch])

  // Clean up highlights when component unmounts
  useEffect(() => {
    return () => {
      removeHighlights()
    }
  }, [removeHighlights])

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    totalMatches,
    activeIndex,
    activeDisplay: totalMatches > 0 ? `${activeIndex + 1} of ${totalMatches}` : "0 matches",
    nextMatch,
    prevMatch,
    clearSearch,
    closeSearch,
    openSearch,
    toggleSearch,
  }
}
