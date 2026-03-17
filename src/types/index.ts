export interface Item {
  id: string           // "minecraft:diamond"
  modId: string        // "minecraft"
  modName: string      // "Minecraft"
  displayName: string  // may contain §-codes
  tooltip: string[]    // lore lines (§-coded)
  textureKey: string   // key in sprite manifest (usually same as id)
  tags: string[]       // ingredient tags for recipe matching
}

export type RecipeType =
  | 'crafting_shaped'
  | 'crafting_shapeless'
  | 'smelting'
  | 'blasting'
  | 'smoking'
  | 'campfire_cooking'
  | 'stonecutting'
  | 'smithing'
  | 'generic'

export interface Ingredient {
  itemId?: string
  tag?: string
  count?: number
}

export interface Recipe {
  id: string
  type: RecipeType
  inputs: Ingredient[][]  // indexed by slot; each slot has 1+ alternatives
  output: Ingredient
  outputCount: number
  machine?: string        // display label for mod-specific machines
}

export interface SpriteManifest {
  sheetWidth: number
  sheetHeight: number
  icons: Record<string, { x: number; y: number; w: number; h: number }>
}
