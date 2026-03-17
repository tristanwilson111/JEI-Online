import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useJEIStore } from '../../store/jeiStore'
import { ItemCell } from './ItemCell'
import './ItemGrid.css'

const CELL_SIZE = 36
const PADDING = 4

interface ItemGridProps {
  columnCount?: number
}

export function ItemGrid({ columnCount = 9 }: ItemGridProps) {
  const filteredItems = useJEIStore(s => s.filteredItems)
  const scrollRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < filteredItems.length; i += columnCount) {
      result.push(filteredItems.slice(i, i + columnCount))
    }
    return result
  }, [filteredItems, columnCount])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CELL_SIZE + PADDING,
    overscan: 5,
  })

  return (
    <div className="item-grid-wrapper" ref={scrollRef}>
      <div
        className="item-grid-inner"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            className="item-grid-row"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {rows[virtualRow.index].map(item => (
              <ItemCell
                key={item.id}
                item={item}
                size={CELL_SIZE}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
