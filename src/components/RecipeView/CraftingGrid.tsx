import type { Recipe } from '../../types'
import { ItemIcon } from '../ItemIcon/ItemIcon'
import { useJEIStore } from '../../store/jeiStore'
import './RecipeView.css'

interface CraftingGridProps {
  recipe: Recipe
}

export function CraftingGrid({ recipe }: CraftingGridProps) {
  const { spriteManifest, items, selectItem } = useJEIStore(s => ({
    spriteManifest: s.spriteManifest,
    items: s.items,
    selectItem: s.selectItem,
  }))

  const isShapeless = recipe.type === 'crafting_shapeless'
  const gridSize = isShapeless ? recipe.inputs.length : 9
  const cols = isShapeless ? Math.ceil(Math.sqrt(recipe.inputs.length)) : 3

  // For shaped, pad to 9 slots
  const slots = isShapeless
    ? recipe.inputs
    : Array.from({ length: 9 }, (_, i) => recipe.inputs[i] ?? [])

  const getItemForIngredient = (ing: { itemId?: string; tag?: string }) => {
    if (ing.itemId) return items.find(it => it.id === ing.itemId)
    if (ing.tag) return items.find(it => it.tags.includes(ing.tag!))
    return undefined
  }

  const outputItem = getItemForIngredient(recipe.output)

  return (
    <div className="crafting-grid">
      <div
        className={`crafting-grid__inputs ${isShapeless ? 'crafting-grid__inputs--shapeless' : ''}`}
        style={{ gridTemplateColumns: `repeat(${cols}, 36px)` }}
      >
        {slots.map((slot, i) => {
          const ing = slot[0]
          const item = ing ? getItemForIngredient(ing) : undefined
          return (
            <div
              key={i}
              className={`recipe-slot ${item ? 'recipe-slot--filled' : ''}`}
              onClick={() => item && selectItem(item, 'recipes')}
              title={ing?.itemId ?? ing?.tag ?? ''}
            >
              {item && (
                <ItemIcon
                  textureKey={item.textureKey}
                  spriteManifest={spriteManifest}
                  size={32}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="crafting-grid__arrow">
        {isShapeless ? '⟳' : '→'}
      </div>

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
  )
}
