import { useJEIStore } from '../../store/jeiStore'
import './RecipeView.css'

interface RecipePagerProps {
  total: number
  current: number
  label: string
}

export function RecipePager({ total, current, label }: RecipePagerProps) {
  const nextPage = useJEIStore(s => s.nextPage)
  const prevPage = useJEIStore(s => s.prevPage)

  if (total <= 1) return null

  return (
    <div className="recipe-pager">
      <button
        className="recipe-pager__btn"
        onClick={prevPage}
        disabled={current === 0}
        aria-label="Previous recipe"
      >
        ◀
      </button>
      <span className="recipe-pager__label">
        {label} {current + 1}/{total}
      </span>
      <button
        className="recipe-pager__btn"
        onClick={nextPage}
        disabled={current === total - 1}
        aria-label="Next recipe"
      >
        ▶
      </button>
    </div>
  )
}
