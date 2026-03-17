import { useEffect } from 'react'
import { useJEIStore } from '../store/jeiStore'
import type { Item, Recipe, SpriteManifest } from '../types'

export function useItemData() {
  const { loadData, setLoading, setError } = useJEIStore()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)

        // Load items eagerly
        const itemsRes = await fetch('/data/items.json')
        if (!itemsRes.ok) throw new Error(`Failed to load items.json: ${itemsRes.status}`)
        const items: Item[] = await itemsRes.json()

        // Load sprite manifest
        const manifestRes = await fetch('/data/sprites/manifest.json')
        let spriteManifest: SpriteManifest['icons'] = {}
        if (manifestRes.ok) {
          const manifest: SpriteManifest = await manifestRes.json()
          spriteManifest = manifest.icons
        }

        // Lazy-load recipes
        const recipesRes = await fetch('/data/recipes.json')
        let recipes: Recipe[] = []
        if (recipesRes.ok) {
          recipes = await recipesRes.json()
        }

        if (!cancelled) {
          loadData(items, recipes, spriteManifest)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [loadData, setLoading, setError])
}
