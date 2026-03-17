import { useState, useRef } from 'react'
import { SearchBar } from '../SearchBar/SearchBar'
import { ItemGrid } from '../ItemGrid/ItemGrid'
import { RecipeView } from '../RecipeView/RecipeView'
import { useJEIStore } from '../../store/jeiStore'
import './Layout.css'

export function MobileLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const { mobileTab, setMobileTab, filteredCount, totalCount } = useJEIStore(s => ({
    mobileTab: s.mobileTab,
    setMobileTab: s.setMobileTab,
    filteredCount: s.filteredItems.length,
    totalCount: s.items.length,
  }))

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  return (
    <div className="mobile-layout">
      <div className="mobile-layout__header">
        <span className="mobile-layout__title">JEI Online — ATM10</span>
        <button
          className="mobile-layout__search-btn"
          onClick={openSearch}
          aria-label="Search"
        >
          🔍
        </button>
      </div>

      {searchOpen && (
        <div className="mobile-layout__search-bar">
          <SearchBar inputRef={searchRef} />
          <button
            className="mobile-layout__search-close"
            onClick={() => setSearchOpen(false)}
          >
            ✕
          </button>
          <span className="mobile-layout__count">
            {filteredCount}/{totalCount}
          </span>
        </div>
      )}

      <div className="mobile-layout__content">
        {mobileTab === 'grid' ? (
          <ItemGrid columnCount={5} />
        ) : (
          <RecipeView />
        )}
      </div>

      <nav className="mobile-layout__tab-bar">
        <button
          className={`mobile-layout__tab ${mobileTab === 'grid' ? 'active' : ''}`}
          onClick={() => setMobileTab('grid')}
        >
          Items
        </button>
        <button
          className={`mobile-layout__tab ${mobileTab === 'recipe' ? 'active' : ''}`}
          onClick={() => setMobileTab('recipe')}
        >
          Recipe
        </button>
      </nav>
    </div>
  )
}
