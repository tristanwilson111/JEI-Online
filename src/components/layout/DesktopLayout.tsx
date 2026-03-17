import { useRef } from 'react'
import { SearchBar } from '../SearchBar/SearchBar'
import { ItemGrid } from '../ItemGrid/ItemGrid'
import { RecipeView } from '../RecipeView/RecipeView'
import { Tooltip } from '../Tooltip/Tooltip'
import { useKeyboard } from '../../hooks/useKeyboard'
import { useJEIStore } from '../../store/jeiStore'
import './Layout.css'

export function DesktopLayout() {
  const searchRef = useRef<HTMLInputElement>(null)
  useKeyboard(searchRef)

  const filteredCount = useJEIStore(s => s.filteredItems.length)
  const totalCount = useJEIStore(s => s.items.length)

  return (
    <div className="desktop-layout">
      <div className="desktop-layout__recipe-panel mc-panel">
        <RecipeView />
      </div>

      <div className="desktop-layout__item-panel mc-panel">
        <div className="desktop-layout__search-row">
          <SearchBar inputRef={searchRef} />
          <span className="desktop-layout__count">
            {filteredCount}/{totalCount}
          </span>
        </div>
        <ItemGrid columnCount={9} />
      </div>

      <Tooltip />
    </div>
  )
}
