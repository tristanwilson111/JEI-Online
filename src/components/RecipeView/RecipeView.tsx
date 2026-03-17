import { useJEIStore } from '../../store/jeiStore'
import { useShallow } from 'zustand/react/shallow'
import { parseFormatted, stripFormatting } from '../../utils/formatting'
import { CraftingGrid } from './CraftingGrid'
import { FurnaceView } from './FurnaceView'
import { GenericRecipe } from './GenericRecipe'
import { RecipePager } from './RecipePager'
import type { Recipe } from '../../types'
import './RecipeView.css'

export function RecipeView() {
  const { selectedItem, viewMode, recipePageIndex, recipesByOutput, recipesByInput, goBack } =
    useJEIStore(useShallow(s => ({
      selectedItem: s.selectedItem,
      viewMode: s.viewMode,
      recipePageIndex: s.recipePageIndex,
      recipesByOutput: s.recipesByOutput,
      recipesByInput: s.recipesByInput,
      goBack: s.goBack,
    })))

  const selectItem = useJEIStore(s => s.selectItem)

  if (!selectedItem) {
    return (
      <div className="recipe-view recipe-view--empty">
        <p className="recipe-view__hint">
          Click an item to see its recipes.<br />
          Right-click (or double-tap) to see uses.<br />
          <span className="recipe-view__hint-keys">R = recipes  U = uses</span>
        </p>
      </div>
    )
  }

  const recipes =
    viewMode === 'recipes'
      ? (recipesByOutput.get(selectedItem.id) ?? [])
      : (recipesByInput.get(selectedItem.id) ?? [])

  const currentRecipe: Recipe | undefined = recipes[recipePageIndex]
  const label = viewMode === 'recipes' ? 'Recipe' : 'Use'
  const itemName = stripFormatting(selectedItem.displayName)

  return (
    <div className="recipe-view">
      <div className="recipe-view__header">
        <button className="recipe-view__back" onClick={goBack} title="Back (Escape)">
          ◀ Back
        </button>
        <span className="recipe-view__item-name">
          {selectedItem.displayName.includes('§')
            ? parseFormatted(selectedItem.displayName)
            : itemName}
        </span>
      </div>

      <div className="recipe-view__tabs">
        <button
          className={`recipe-view__tab ${viewMode === 'recipes' ? 'active' : ''}`}
          onClick={() => selectItem(selectedItem, 'recipes')}
        >
          Recipes
          {recipesByOutput.get(selectedItem.id)?.length
            ? ` (${recipesByOutput.get(selectedItem.id)!.length})`
            : ''}
        </button>
        <button
          className={`recipe-view__tab ${viewMode === 'uses' ? 'active' : ''}`}
          onClick={() => selectItem(selectedItem, 'uses')}
        >
          Uses
          {recipesByInput.get(selectedItem.id)?.length
            ? ` (${recipesByInput.get(selectedItem.id)!.length})`
            : ''}
        </button>
      </div>

      <RecipePager total={recipes.length} current={recipePageIndex} label={label} />

      <div className="recipe-view__content">
        {recipes.length === 0 ? (
          <div className="recipe-view__no-recipes">
            No {viewMode} found for {itemName}.
          </div>
        ) : currentRecipe ? (
          renderRecipe(currentRecipe)
        ) : null}
      </div>
    </div>
  )
}

function renderRecipe(recipe: Recipe) {
  switch (recipe.type) {
    case 'crafting_shaped':
    case 'crafting_shapeless':
      return <CraftingGrid recipe={recipe} />
    case 'smelting':
    case 'blasting':
    case 'smoking':
    case 'campfire_cooking':
      return <FurnaceView recipe={recipe} />
    default:
      return <GenericRecipe recipe={recipe} />
  }
}
