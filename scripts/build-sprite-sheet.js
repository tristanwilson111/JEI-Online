/**
 * build-sprite-sheet.js
 *
 * Packs all extracted 16x16 PNG textures into a single sprite sheet.
 * Uses 'sharp' for image processing.
 *
 * Input:  cache/textures/<modid>/item/*.png
 *         cache/textures/<modid>/block/*.png
 * Output: cache/sprites/manifest.json
 *         public/data/sprites/sheet.png
 *         public/data/sprites/manifest.json
 */

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const CACHE_DIR = path.resolve('cache')
const TEXTURES_DIR = path.join(CACHE_DIR, 'textures')
const SPRITES_OUT_CACHE = path.join(CACHE_DIR, 'sprites')
const SPRITES_OUT_PUBLIC = path.resolve('public', 'data', 'sprites')

const ICON_SIZE = 16
const ICONS_PER_ROW = 64  // 64 * 16 = 1024px wide

export async function buildSpriteSheet() {
  fs.mkdirSync(SPRITES_OUT_CACHE, { recursive: true })
  fs.mkdirSync(SPRITES_OUT_PUBLIC, { recursive: true })

  if (!fs.existsSync(TEXTURES_DIR)) {
    console.warn('  No textures found — skipping sprite sheet generation')
    // Write empty manifest
    const emptyManifest = { sheetWidth: 0, sheetHeight: 0, icons: {} }
    const manifestJson = JSON.stringify(emptyManifest, null, 2)
    fs.writeFileSync(path.join(SPRITES_OUT_CACHE, 'manifest.json'), manifestJson)
    fs.writeFileSync(path.join(SPRITES_OUT_PUBLIC, 'manifest.json'), manifestJson)
    return
  }

  console.log('  Collecting texture files...')
  const entries = [] // { key: 'modid:itemname', filePath }

  for (const modId of fs.readdirSync(TEXTURES_DIR)) {
    const modDir = path.join(TEXTURES_DIR, modId)
    if (!fs.statSync(modDir).isDirectory()) continue

    for (const subtype of ['item', 'block']) {
      const subtypeDir = path.join(modDir, subtype)
      if (!fs.existsSync(subtypeDir)) continue

      for (const file of fs.readdirSync(subtypeDir)) {
        if (!file.endsWith('.png')) continue
        const itemName = file.replace('.png', '')
        const key = `${modId}:${itemName}`
        entries.push({ key, filePath: path.join(subtypeDir, file) })
      }
    }
  }

  // Deduplicate: prefer 'item' over 'block' for same key
  const seen = new Set()
  const deduped = entries.filter(e => {
    if (seen.has(e.key)) return false
    seen.add(e.key)
    return true
  })

  console.log(`  Building sprite sheet with ${deduped.length} icons...`)

  const rows = Math.ceil(deduped.length / ICONS_PER_ROW)
  const sheetWidth = Math.min(deduped.length, ICONS_PER_ROW) * ICON_SIZE
  const sheetHeight = rows * ICON_SIZE

  // Create blank sheet
  const composites = []
  const icons = {}

  for (let i = 0; i < deduped.length; i++) {
    const { key, filePath } = deduped[i]
    const col = i % ICONS_PER_ROW
    const row = Math.floor(i / ICONS_PER_ROW)
    const x = col * ICON_SIZE
    const y = row * ICON_SIZE

    icons[key] = { x, y, w: ICON_SIZE, h: ICON_SIZE }

    try {
      const resized = await sharp(filePath)
        .resize(ICON_SIZE, ICON_SIZE, { fit: 'fill', kernel: 'nearest' })
        .toBuffer()

      composites.push({ input: resized, left: x, top: y })
    } catch {
      // Skip unreadable textures
    }

    if (i > 0 && i % 1000 === 0) {
      console.log(`  Progress: ${i}/${deduped.length}`)
    }
  }

  const sheetPath = path.join(SPRITES_OUT_PUBLIC, 'sheet.png')

  await sharp({
    create: {
      width: sheetWidth || 1,
      height: sheetHeight || 1,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(sheetPath)

  const manifest = { sheetWidth, sheetHeight, icons }
  const manifestJson = JSON.stringify(manifest, null, 2)
  fs.writeFileSync(path.join(SPRITES_OUT_CACHE, 'manifest.json'), manifestJson)
  fs.writeFileSync(path.join(SPRITES_OUT_PUBLIC, 'manifest.json'), manifestJson)

  const stat = fs.statSync(sheetPath)
  console.log(`  Sheet: ${sheetWidth}×${sheetHeight}px, ${(stat.size / 1e6).toFixed(1)} MB`)
  console.log(`  Written: ${sheetPath}`)
  console.log(`  Written: manifest.json (${Object.keys(icons).length} entries)`)
}
