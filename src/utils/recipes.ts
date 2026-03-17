import type { Recipe } from '../types'

export function buildRecipeMaps(recipes: Recipe[]): {
  byOutput: Map<string, Recipe[]>
  byInput: Map<string, Recipe[]>
} {
  const byOutput = new Map<string, Recipe[]>()
  const byInput = new Map<string, Recipe[]>()

  for (const recipe of recipes) {
    const outId = recipe.output.itemId
    if (outId) {
      if (!byOutput.has(outId)) byOutput.set(outId, [])
      byOutput.get(outId)!.push(recipe)
    }

    for (const slot of recipe.inputs) {
      for (const ing of slot) {
        if (ing.itemId) {
          if (!byInput.has(ing.itemId)) byInput.set(ing.itemId, [])
          byInput.get(ing.itemId)!.push(recipe)
        }
      }
    }
  }

  return { byOutput, byInput }
}

export const RECIPE_TYPE_LABELS: Record<string, string> = {
  crafting_shaped: 'Crafting',
  crafting_shapeless: 'Crafting (Shapeless)',
  smelting: 'Furnace',
  blasting: 'Blast Furnace',
  smoking: 'Smoker',
  campfire_cooking: 'Campfire',
  stonecutting: 'Stonecutter',
  smithing: 'Smithing Table',
  generic: 'Recipe',
}
