import type { Recipe } from '../../types'
import { ItemIcon } from '../ItemIcon/ItemIcon'
import { useJEIStore } from '../../store/jeiStore'
import { useShallow } from 'zustand/react/shallow'
import { RECIPE_TYPE_LABELS } from '../../utils/recipes'
import './RecipeView.css'

interface GenericRecipeProps {
  recipe: Recipe
}

export function GenericRecipe({ recipe }: GenericRecipeProps) {
  const { spriteManifest, items, selectItem } = useJEIStore(useShallow(s => ({
    spriteManifest: s.spriteManifest,
    items: s.items,
    selectItem: s.selectItem,
  })))

  const getItem = (id?: string, tag?: string) =>
    id ? items.find(it => it.id === id) : tag ? items.find(it => it.tags.includes(tag)) : undefined

  const label = recipe.machine ?? RECIPE_TYPE_LABELS[recipe.type] ?? 'Recipe'
  const outputItem = getItem(recipe.output.itemId, recipe.output.tag)

  return (
    <div className="generic-recipe">
      <div className="generic-recipe__label">{label}</div>
      <div className="generic-recipe__inputs">
        {recipe.inputs.map((slot, i) => {
          const ing = slot[0]
          const item = ing ? getItem(ing.itemId, ing.tag) : undefined
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
      <div className="generic-recipe__arrow">→</div>
      <div
        className="recipe-slot recipe-slot--output recipe-slot--filled"
        onClick={() => outputItem && selectItem(outputItem, 'recipes')}
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
