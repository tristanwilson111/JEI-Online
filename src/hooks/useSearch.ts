import { useCallback, useRef } from 'react'
import { useJEIStore } from '../store/jeiStore'

export function useSearch() {
  const searchQuery = useJEIStore(s => s.searchQuery)
  const setSearch = useJEIStore(s => s.setSearch)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value)
    }, 80)
  }, [setSearch])

  return { searchQuery, handleChange }
}
