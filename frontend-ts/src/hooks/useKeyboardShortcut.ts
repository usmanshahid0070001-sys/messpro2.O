import { useEffect, useRef } from 'react'

type KeyCombo = string[] // e.g. ['control', 'm'] or ['meta', 't'] or ['/']

interface ShortcutOptions {
  allowInInputs?: boolean
  preventDefault?: boolean
  useCapture?: boolean
}

/**
 * Custom hook to register global keyboard shortcuts cleanly.
 * Automatically ignores execution when typing inside text inputs, textareas, or select dropdowns.
 */
export function useKeyboardShortcut(
  combo: KeyCombo,
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  const { allowInInputs = false, preventDefault = true, useCapture = true } = options
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!allowInInputs) {
        const target = e.target as HTMLElement | null
        const isInput =
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.tagName === 'SELECT' ||
          target?.isContentEditable

        if (isInput) return
      }

      const key = e.key.toLowerCase()
      const normalizedCombo = combo.map((k) => k.toLowerCase())
      
      const matchCtrl = normalizedCombo.includes('control') || normalizedCombo.includes('ctrl')
      const matchMeta = normalizedCombo.includes('meta') || normalizedCombo.includes('cmd')
      const matchShift = normalizedCombo.includes('shift')
      const matchAlt = normalizedCombo.includes('alt')

      const ctrlPressed = e.ctrlKey
      const metaPressed = e.metaKey
      const shiftPressed = e.shiftKey
      const altPressed = e.altKey

      if (matchCtrl && !ctrlPressed && !metaPressed) return
      if (matchMeta && !metaPressed && !ctrlPressed) return
      if (matchShift && !shiftPressed) return
      if (matchAlt && !altPressed) return

      const actionKey = normalizedCombo.find(
        (k) => !['control', 'ctrl', 'meta', 'cmd', 'shift', 'alt'].includes(k)
      )

      if (actionKey && key === actionKey) {
        if (preventDefault) {
          e.preventDefault()
        }
        savedCallback.current(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown, useCapture)
    return () => window.removeEventListener('keydown', handleKeyDown, useCapture)
  }, [combo, allowInInputs, preventDefault, useCapture])
}
