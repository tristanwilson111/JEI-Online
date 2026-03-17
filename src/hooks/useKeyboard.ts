import { useEffect, useRef } from 'react'
import { useJEIStore } from '../store/jeiStore'

export function useKeyboard(searchInputRef: React.RefObject<HTMLInputElement | null>) {
  const hoveredItem = useJEIStore(s => s.hoveredItem)
  const selectItem = useJEIStore(s => s.selectItem)
  const goBack = useJEIStore(s => s.goBack)

  const hoveredRef = useRef(hoveredItem)
  hoveredRef.current = hoveredItem

  const selectRef = useRef(selectItem)
  selectRef.current = selectItem

  const goBackRef = useRef(goBack)
  goBackRef.current = goBack

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA'

      if (e.key === 'Escape') {
        if (inInput && searchInputRef.current) {
          searchInputRef.current.blur()
        } else {
          goBackRef.current()
        }
        return
      }

      if (inInput) return

      if (e.key === '/' || (e.ctrlKey && e.key === 'f')) {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      if (e.key === 'r' || e.key === 'R') {
        if (hoveredRef.current) {
          selectRef.current(hoveredRef.current, 'recipes')
        }
        return
      }

      if (e.key === 'u' || e.key === 'U') {
        if (hoveredRef.current) {
          selectRef.current(hoveredRef.current, 'uses')
        }
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [searchInputRef])
}
