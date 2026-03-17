import { create } from 'zustand'
import type { Item, Recipe } from '../types'
import { buildSearchIndex, filterItems, type SearchIndex } from '../utils/search'
import { buildRecipeMaps } from '../utils/recipes'

interface JEIStore {
  // Data
  items: Item[]
  recipes: Recipe[]
  recipesByOutput: Map<string, Recipe[]>
  recipesByInput: Map<string, Recipe[]>
  searchIndex: SearchIndex | null
  spriteManifest: Record<string, { x: number; y: number; w: number; h: number }>
  loading: boolean
  error: string | null

  // Search
  searchQuery: string
  filteredItems: Item[]

  // Selection
  selectedItem: Item | null
  viewMode: 'recipes' | 'uses'
  recipePageIndex: number

  // UI state
  hoveredItem: Item | null
  tooltipPos: { x: number; y: number } | null
  mobileTab: 'grid' | 'recipe'

  // Actions
  loadData(items: Item[], recipes: Recipe[], spriteManifest: Record<string, { x: number; y: number; w: number; h: number }>): void
  setLoading(loading: boolean): void
  setError(error: string | null): void
  setSearch(q: string): void
  selectItem(item: Item, mode: 'recipes' | 'uses'): void
  setHovered(item: Item | null, pos?: { x: number; y: number }): void
  goBack(): void
  nextPage(): void
  prevPage(): void
  setMobileTab(tab: 'grid' | 'recipe'): void
}

export const useJEIStore = create<JEIStore>((set, get) => ({
  items: [],
  recipes: [],
  recipesByOutput: new Map(),
  recipesByInput: new Map(),
  searchIndex: null,
  spriteManifest: {},
  loading: true,
  error: null,

  searchQuery: '',
  filteredItems: [],

  selectedItem: null,
  viewMode: 'recipes',
  recipePageIndex: 0,

  hoveredItem: null,
  tooltipPos: null,
  mobileTab: 'grid',

  loadData(items, recipes, spriteManifest) {
    const searchIndex = buildSearchIndex(items)
    const { byOutput, byInput } = buildRecipeMaps(recipes)
    set({
      items,
      recipes,
      recipesByOutput: byOutput,
      recipesByInput: byInput,
      searchIndex,
      spriteManifest,
      filteredItems: items,
      loading: false,
    })
  },

  setLoading(loading) { set({ loading }) },
  setError(error) { set({ error, loading: false }) },

  setSearch(q) {
    const { searchIndex } = get()
    const filtered = searchIndex ? filterItems(searchIndex, q) : []
    set({ searchQuery: q, filteredItems: filtered, recipePageIndex: 0 })
  },

  selectItem(item, mode) {
    set({ selectedItem: item, viewMode: mode, recipePageIndex: 0, mobileTab: 'recipe' })
  },

  setHovered(item, pos) {
    set({ hoveredItem: item, tooltipPos: pos ?? null })
  },

  goBack() {
    set({ selectedItem: null, recipePageIndex: 0, mobileTab: 'grid' })
  },

  nextPage() {
    const { recipePageIndex, selectedItem, viewMode, recipesByOutput, recipesByInput } = get()
    if (!selectedItem) return
    const recipes = viewMode === 'recipes'
      ? (recipesByOutput.get(selectedItem.id) ?? [])
      : (recipesByInput.get(selectedItem.id) ?? [])
    set({ recipePageIndex: Math.min(recipePageIndex + 1, recipes.length - 1) })
  },

  prevPage() {
    const { recipePageIndex } = get()
    set({ recipePageIndex: Math.max(recipePageIndex - 1, 0) })
  },

  setMobileTab(tab) { set({ mobileTab: tab }) },
}))
