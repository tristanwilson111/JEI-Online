/**
 * normalize-data.js
 *
 * Merges all extracted data sources into items.json and recipes.json.
 *
 * Inputs:
 *   cache/lang/<modid>.json         -- item display names
 *   cache/recipes/<modid>/ ** /*.json -- recipe JSON files (recursive)
 *   cache/kubejs/                   -- KubeJS recipe scripts
 *   cache/sprites/manifest.json     -- sprite sheet manifest
 *
 * Outputs:
 *   public/data/items.json
 *   public/data/recipes.json
 */

import fs from 'node:fs'
import path from 'node:path'

const CACHE_DIR = path.resolve('cache')
const LANG_DIR = path.join(CACHE_DIR, 'lang')
const RECIPES_DIR = path.join(CACHE_DIR, 'recipes')
const KUBEJS_DIR = path.join(CACHE_DIR, 'kubejs')
const SPRITE_MANIFEST = path.join(CACHE_DIR, 'sprites', 'manifest.json')

const PUBLIC_DATA = path.resolve('public', 'data')

// Well-known mod display names (modid → human-readable name)
const MOD_NAMES = {
  minecraft: 'Minecraft',
  forge: 'Forge',
  neoforge: 'NeoForge',
  create: 'Create',
  ae2: 'Applied Energistics 2',
  thermal: 'Thermal Series',
  mekanism: 'Mekanism',
  botania: 'Botania',
  ars_nouveau: 'Ars Nouveau',
  occultism: 'Occultism',
  ftbquests: 'FTB Quests',
  kubejs: 'KubeJS',
  jei: 'JEI',
}

/**
 * Flatten a Minecraft text component (possibly nested) to a plain string.
 * Handles raw strings, `{"text":"..."}` objects, and arrays thereof.
 */
function flattenText(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(flattenText).join('')
  if (value && typeof value === 'object') {
    return flattenText(value.text ?? value.translate ?? '')
  }
  return String(value ?? '')
}

function getModName(modId) {
  return MOD_NAMES[modId] ?? modId
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Build a map of itemId → displayName from all lang files.
 * Lang keys follow the pattern: item.<modid>.<itemname> or block.<modid>.<blockname>
 */
function buildDisplayNames() {
  const map = new Map() // itemId → displayName

  if (!fs.existsSync(LANG_DIR)) return map

  for (const file of fs.readdirSync(LANG_DIR)) {
    if (!file.endsWith('.json')) continue
    const modId = file.replace('.json', '')
    try {
      const data = JSON.parse(fs.readFileSync(path.join(LANG_DIR, file), 'utf-8'))
      for (const [key, value] of Object.entries(data)) {
        // item.modid.itemname → modid:itemname
        const itemMatch = key.match(/^item\.([^.]+)\.(.+)$/)
        if (itemMatch) {
          map.set(`${itemMatch[1]}:${itemMatch[2]}`, flattenText(value))
          continue
        }
        // block.modid.blockname → modid:blockname
        const blockMatch = key.match(/^block\.([^.]+)\.(.+)$/)
        if (blockMatch) {
          map.set(`${blockMatch[1]}:${blockMatch[2]}`, flattenText(value))
        }
      }
    } catch {
      // skip malformed files
    }
  }

  return map
}

/**
 * Parse the Minecraft recipe JSON format into our Recipe type.
 */
function parseRecipeJson(id, data) {
  const type = data.type ?? 'generic'

  // Normalize recipe type to our enum
  const normalizedType = normalizeRecipeType(type)

  if (normalizedType === 'crafting_shaped') {
    return parseShapedCrafting(id, data)
  }
  if (normalizedType === 'crafting_shapeless') {
    return parseShapelessCrafting(id, data)
  }
  if (['smelting', 'blasting', 'smoking', 'campfire_cooking', 'stonecutting'].includes(normalizedType)) {
    return parseSingleInputRecipe(id, data, normalizedType)
  }

  // Generic fallback
  return parseGenericRecipe(id, data, normalizedType)
}

function normalizeRecipeType(type) {
  const t = type.toLowerCase().replace(/^minecraft:/, '')
  if (t.includes('shaped') && !t.includes('shapeless')) return 'crafting_shaped'
  if (t.includes('shapeless')) return 'crafting_shapeless'
  if (t === 'smelting') return 'smelting'
  if (t === 'blasting') return 'blasting'
  if (t === 'smoking') return 'smoking'
  if (t === 'campfire_cooking') return 'campfire_cooking'
  if (t === 'stonecutting') return 'stonecutting'
  if (t === 'smithing' || t === 'smithing_transform') return 'smithing'
  return 'generic'
}

function ingredientFromJson(raw) {
  if (!raw) return []
  // Array of alternatives
  if (Array.isArray(raw)) return raw.map(r => ingredientFromJson(r)).flat()
  if (typeof raw === 'string') {
    if (raw.startsWith('#')) return [{ tag: raw.slice(1) }]
    return [{ itemId: raw }]
  }
  if (raw.item) return [{ itemId: raw.item }]
  if (raw.tag) return [{ tag: raw.tag }]
  return []
}

function parseShapedCrafting(id, data) {
  const pattern = data.pattern ?? []
  const key = data.key ?? {}
  const slots = Array(9).fill(null).map(() => [])

  let row = 0
  for (const line of pattern) {
    let col = 0
    for (const ch of line) {
      if (ch !== ' ' && key[ch]) {
        slots[row * 3 + col] = ingredientFromJson(key[ch])
      }
      col++
    }
    row++
  }

  return {
    id,
    type: 'crafting_shaped',
    inputs: slots,
    output: ingredientFromJson(data.result)[0] ?? {},
    outputCount: data.result?.count ?? 1,
  }
}

function parseShapelessCrafting(id, data) {
  const ingredients = (data.ingredients ?? []).map(i => ingredientFromJson(i))
  return {
    id,
    type: 'crafting_shapeless',
    inputs: ingredients,
    output: ingredientFromJson(data.result)[0] ?? {},
    outputCount: data.result?.count ?? 1,
  }
}

function parseSingleInputRecipe(id, data, type) {
  const input = ingredientFromJson(data.ingredient)
  return {
    id,
    type,
    inputs: [input],
    output: ingredientFromJson(data.result)[0] ?? { itemId: data.result },
    outputCount: data.count ?? data.result?.count ?? 1,
  }
}

function parseGenericRecipe(id, data, type) {
  const inputs = []
  if (data.ingredient) inputs.push(ingredientFromJson(data.ingredient))
  if (data.ingredients) {
    for (const i of data.ingredients) inputs.push(ingredientFromJson(i))
  }
  const resultRaw = data.result ?? data.output
  const output = resultRaw ? (ingredientFromJson(resultRaw)[0] ?? { itemId: String(resultRaw) }) : {}
  return {
    id,
    type,
    inputs,
    output,
    outputCount: resultRaw?.count ?? 1,
  }
}

/**
 * Walk recipe directory and collect all Recipe objects.
 */
function collectRecipes() {
  const recipes = []
  if (!fs.existsSync(RECIPES_DIR)) return recipes

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(full, 'utf-8'))
          if (!data.type) continue

          // Build a stable recipe ID from path
          const rel = path.relative(RECIPES_DIR, full).replace(/\\/g, '/')
          const id = rel.replace(/\.json$/, '').replace(/\//g, ':')
          const recipe = parseRecipeJson(id, data)
          if (recipe && recipe.output && (recipe.output.itemId || recipe.output.tag)) {
            recipes.push(recipe)
          }
        } catch {
          // skip malformed
        }
      }
    }
  }

  walk(RECIPES_DIR)
  return recipes
}

/**
 * Build the item list from display names + sprite manifest.
 * An item is "known" if it has a lang entry or a texture.
 */
function buildItems(displayNames, spriteManifest) {
  const items = []
  const seen = new Set()

  // From lang files
  for (const [itemId, displayName] of displayNames) {
    if (seen.has(itemId)) continue
    // Skip lang keys that aren't valid item IDs (dots in path = tooltip/variant keys)
    const path = itemId.split(':')[1] ?? ''
    if (path.includes('.')) continue
    seen.add(itemId)

    const [modId] = itemId.split(':')
    items.push({
      id: itemId,
      modId,
      modName: getModName(modId),
      displayName,
      tooltip: [],
      textureKey: itemId,
      tags: [],
    })
  }

  // From sprite manifest (items that have textures but may not have lang)
  for (const textureKey of Object.keys(spriteManifest.icons ?? {})) {
    if (seen.has(textureKey)) continue
    seen.add(textureKey)
    const [modId] = textureKey.split(':')
    const rawName = textureKey.split(':')[1] ?? textureKey
    items.push({
      id: textureKey,
      modId,
      modName: getModName(modId),
      displayName: rawName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      tooltip: [],
      textureKey,
      tags: [],
    })
  }

  // Sort: minecraft first, then alphabetical by modId then displayName
  items.sort((a, b) => {
    if (a.modId === 'minecraft' && b.modId !== 'minecraft') return -1
    if (b.modId === 'minecraft' && a.modId !== 'minecraft') return 1
    const modCmp = a.modId.localeCompare(b.modId)
    if (modCmp !== 0) return modCmp
    return String(a.displayName ?? '').localeCompare(String(b.displayName ?? ''))
  })

  return items
}

export async function normalizeData() {
  fs.mkdirSync(PUBLIC_DATA, { recursive: true })

  console.log('  Building display name index...')
  const displayNames = buildDisplayNames()
  console.log(`  Found ${displayNames.size} item display names`)

  console.log('  Loading sprite manifest...')
  let spriteManifest = { icons: {} }
  if (fs.existsSync(SPRITE_MANIFEST)) {
    spriteManifest = JSON.parse(fs.readFileSync(SPRITE_MANIFEST, 'utf-8'))
  } else {
    console.warn('  Sprite manifest not found — textures will be missing')
  }

  console.log('  Collecting recipes...')
  const recipes = collectRecipes()
  console.log(`  Found ${recipes.length} recipes`)

  console.log('  Building item list...')
  const items = buildItems(displayNames, spriteManifest)
  console.log(`  Found ${items.length} items`)

  if (items.length === 0) {
    console.warn('  No items found — JAR extraction has not been run yet.')
    console.warn('  Keeping existing public/data/items.json unchanged.')
    return
  }

  const itemsPath = path.join(PUBLIC_DATA, 'items.json')
  const recipesPath = path.join(PUBLIC_DATA, 'recipes.json')

  fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2))
  fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2))

  console.log(`  Written: ${itemsPath}`)
  console.log(`  Written: ${recipesPath}`)
}
