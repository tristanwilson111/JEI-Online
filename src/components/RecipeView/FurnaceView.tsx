import type { Recipe } from '../../types'
import { ItemIcon } from '../ItemIcon/ItemIcon'
import { useJEIStore } from '../../store/jeiStore'
import { RECIPE_TYPE_LABELS } from '../../utils/recipes'
import './RecipeView.css'

interface FurnaceViewProps {
  recipe: Recipe
}

export function FurnaceView({ recipe }: FurnaceViewProps) {
  const { spriteManifest, items, selectItem } = useJEIStore(s => ({
    spriteManifest: s.spriteManifest,
    items: s.items,
    selectItem: s.selectItem,
  }))

  const getItem = (id?: string, tag?: string) => {
    if (id) return items.find(it => it.id === id)
    if (tag) return items.find(it => it.tags.includes(tag))
    return undefined
  }

  const inputIng = recipe.inputs[0]?.[0]
  const inputItem = getItem(inputIng?.itemId, inputIng?.tag)
  const outputItem = getItem(recipe.output.itemId, recipe.output.tag)

  const label = recipe.machine ?? RECIPE_TYPE_LABELS[recipe.type] ?? 'Recipe'

  return (
    <div className="furnace-view">
      <div className="furnace-view__machine-label">{label}</div>
      <div className="furnace-view__body">
        <div
          className={`recipe-slot ${inputItem ? 'recipe-slot--filled' : ''}`}
          onClick={() => inputItem && selectItem(inputItem, 'recipes')}
          title={inputIng?.itemId ?? inputIng?.tag}
        >
          {inputItem && (
            <ItemIcon
              textureKey={inputItem.textureKey}
              spriteManifest={spriteManifest}
              size={32}
            />
          )}
        </div>
        <div className="furnace-view__flame">🔥</div>
        <div className="furnace-view__arrow">→</div>
        <div
          className="recipe-slot recipe-slot--output recipe-slot--filled"
          onClick={() => outputItem && selectItem(outputItem, 'recipes')}
          title={recipe.output.itemId}
        >
          {outputItem && (
            <ItemIcon
              textureKey={outputItem.textureKey}
              spriteManifest={spriteManifest}
              size={36}
            />
          )}
          {recipe.outputCount > 1 && (
            <span className="recipe-slot__count">{recipe.outputCount}</span>
          )}
        </div>
      </div>
    </div>
  )
}
