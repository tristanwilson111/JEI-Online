import { useEffect, useRef, useState } from 'react'
import { useJEIStore } from '../../store/jeiStore'
import { parseFormatted } from '../../utils/formatting'
import './Tooltip.css'

const OFFSET_X = 12
const OFFSET_Y = 8

export function Tooltip() {
  const { hoveredItem, tooltipPos } = useJEIStore(s => ({
    hoveredItem: s.hoveredItem,
    tooltipPos: s.tooltipPos,
  }))

  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })

  useEffect(() => {
    if (!tooltipPos || !ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left = tooltipPos.x + OFFSET_X
    let top = tooltipPos.y + OFFSET_Y

    if (left + rect.width > vw - 8) {
      left = tooltipPos.x - rect.width - OFFSET_X
    }
    if (top + rect.height > vh - 8) {
      top = vh - rect.height - 8
    }

    setPos({ left, top })
  }, [tooltipPos, hoveredItem])

  if (!hoveredItem || !tooltipPos) return null

  const name = hoveredItem.displayName
  const hasFormatting = name.includes('§') || name.includes('\u00a7')

  return (
    <div
      ref={ref}
      className="mc-tooltip"
      style={{ left: pos.left, top: pos.top }}
      aria-hidden
    >
      <div className="mc-tooltip__name">
        {hasFormatting ? parseFormatted(name) : name}
      </div>
      <div className="mc-tooltip__mod">
        {hoveredItem.modName}
      </div>
      {hoveredItem.tooltip.map((line, i) => (
        <div key={i} className="mc-tooltip__line">
          {line.includes('§') || line.includes('\u00a7')
            ? parseFormatted(line)
            : line}
        </div>
      ))}
      <div className="mc-tooltip__id">
        {hoveredItem.id}
      </div>
    </div>
  )
}
