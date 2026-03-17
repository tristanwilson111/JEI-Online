import { useRef, useEffect } from 'react'
import { useSearch } from '../../hooks/useSearch'
import './SearchBar.css'

interface SearchBarProps {
  inputRef?: React.RefObject<HTMLInputElement | null>
  placeholder?: string
}

export function SearchBar({ inputRef: externalRef, placeholder = 'Search items... (@mod to filter by mod)' }: SearchBarProps) {
  const internalRef = useRef<HTMLInputElement>(null)
  const ref = externalRef ?? internalRef
  const { searchQuery, handleChange } = useSearch()

  return (
    <div className="search-bar">
      <input
        ref={ref}
        className="search-bar__input"
        type="text"
        value={searchQuery}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        aria-label="Search items"
      />
      <span className="search-bar__icon" aria-hidden>🔍</span>
    </div>
  )
}
