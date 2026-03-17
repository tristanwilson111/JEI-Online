import { useCallback, useRef } from 'react'
import { useJEIStore } from '../store/jeiStore'

export function useSearch() {
  const { searchQuery, setSearch } = useJEIStore(s => ({
    searchQuery: s.searchQuery,
    setSearch: s.setSearch,
  }))

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value)
    }, 80)
  }, [setSearch])

  return { searchQuery, handleChange }
}
