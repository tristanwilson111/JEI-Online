import type { Item } from '../types'
import { stripFormatting } from './formatting'

export interface SearchIndex {
  items: Item[]
  lowerNames: string[]
  lowerMods: string[]
}

export function buildSearchIndex(items: Item[]): SearchIndex {
  return {
    items,
    lowerNames: items.map(item => stripFormatting(typeof item.displayName === 'string' ? item.displayName : String(item.displayName ?? '')).toLowerCase()),
    lowerMods: items.map(item => item.modName.toLowerCase()),
  }
}

export function filterItems(index: SearchIndex, query: string): Item[] {
  if (!query.trim()) return index.items

  const q = query.trim().toLowerCase()

  // Support "@modname" prefix to filter by mod
  if (q.startsWith('@')) {
    const modQuery = q.slice(1)
    return index.items.filter((_, i) =>
      index.lowerMods[i].includes(modQuery)
    )
  }

  return index.items.filter((_, i) =>
    index.lowerNames[i].includes(q) ||
    index.lowerMods[i].includes(q) ||
    index.items[i].id.toLowerCase().includes(q)
  )
}
