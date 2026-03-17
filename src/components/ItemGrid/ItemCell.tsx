import { useCallback, useRef } from 'react'
import type { Item } from '../../types'
import { ItemIcon } from '../ItemIcon/ItemIcon'
import { useJEIStore } from '../../store/jeiStore'
import './ItemGrid.css'

interface ItemCellProps {
  item: Item
  size: number
}

const LONG_PRESS_MS = 500

export function ItemCell({ item, size }: ItemCellProps) {
  const { selectItem, setHovered, spriteManifest } = useJEIStore(s => ({
    selectItem: s.selectItem,
    setHovered: s.setHovered,
    spriteManifest: s.spriteManifest,
  }))

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    setHovered(item, { x: e.clientX, y: e.clientY })
  }, [item, setHovered])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setHovered(item, { x: e.clientX, y: e.clientY })
  }, [item, setHovered])

  const handleMouseLeave = useCallback(() => {
    setHovered(null)
  }, [setHovered])

  const handleClick = useCallback(() => {
    selectItem(item, 'recipes')
  }, [item, selectItem])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    selectItem(item, 'uses')
  }, [item, selectItem])

  // Touch: long press → tooltip-style info (handled by parent), tap → recipes
  const handleTouchStart = useCallback(() => {
    longPressRef.current = setTimeout(() => {
      // Long press triggers tooltip / uses view on mobile
      selectItem(item, 'uses')
    }, LONG_PRESS_MS)
  }, [item, selectItem])

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }, [])

  return (
    <div
      className="item-cell"
      style={{ width: size, height: size }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={item.displayName.replace(/§./g, '')}
    >
      <ItemIcon
        textureKey={item.textureKey}
        spriteManifest={spriteManifest}
        size={size - 4}
      />
    </div>
  )
}
