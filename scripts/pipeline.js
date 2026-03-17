/**
 * pipeline.js — ATM10 data extraction pipeline
 *
 * Steps:
 *   1. fetch-modpack.js     Download ATM10 server pack from CurseForge
 *   2. (Python)             Extract JAR data (lang, recipes, textures)
 *   3. fetch-kubejs.js      Clone ATM10 GitHub repo for KubeJS recipes
 *   4. build-sprite-sheet.js Build sprite sheet from extracted textures
 *   5. normalize-data.js    Merge all data → public/data/items.json + recipes.json
 *
 * Usage:
 *   npm run build:data
 *
 * Env vars:
 *   CURSEFORGE_API_KEY  (optional) CurseForge API key for latest version lookup
 *   SKIP_DOWNLOAD=1     Skip re-downloading server pack (use cached)
 *   SKIP_EXTRACT=1      Skip JAR extraction (use cached lang/recipes/textures)
 *   SKIP_KUBEJS=1       Skip KubeJS fetch
 *   SKIP_SPRITES=1      Skip sprite sheet rebuild
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const {
  SKIP_DOWNLOAD,
  SKIP_EXTRACT,
  SKIP_KUBEJS,
  SKIP_SPRITES,
} = process.env

async function step(name, fn) {
  console.log(`\n[${name}]`)
  const start = Date.now()
  await fn()
  console.log(`  Done in ${((Date.now() - start) / 1000).toFixed(1)}s`)
}

async function run() {
  console.log('=== JEI Online — ATM10 Data Pipeline ===')

  // Step 1: Download server pack
  if (!SKIP_DOWNLOAD) {
    await step('1/5 Fetch ATM10 server pack', async () => {
      const { fetchModpack } = await import('./fetch-modpack.js')
      await fetchModpack()
    })

    // Unzip server pack
    await step('    Unzip server pack', async () => {
      const zipPath = path.resolve('cache', 'atm10-server.zip')
      const outDir = path.resolve('cache', 'server')
      fs.mkdirSync(outDir, { recursive: true })

      if (fs.existsSync(path.join(outDir, 'mods'))) {
        console.log('  Already unzipped, skipping')
        return
      }

      console.log(`  Extracting ${zipPath} → ${outDir}`)
      execSync(`unzip -q -o "${zipPath}" -d "${outDir}"`, { stdio: 'inherit' })
    })
  } else {
    console.log('\n[1/5 Fetch ATM10 server pack] SKIPPED')
  }

  // Step 2: Extract JAR data (Python)
  if (!SKIP_EXTRACT) {
    await step('2/5 Extract JAR data', async () => {
      execSync('python3 scripts/extract-jar-data.py', { stdio: 'inherit' })
    })

    // Extract Minecraft client JAR assets (vanilla textures + lang)
    await step('2b/5 Extract Minecraft client assets', async () => {
      execSync('python3 scripts/extract-minecraft-client.py', { stdio: 'inherit' })
    })
  } else {
    console.log('\n[2/5 Extract JAR data] SKIPPED')
  }

  // Step 3: Fetch KubeJS recipes
  if (!SKIP_KUBEJS) {
    await step('3/5 Fetch KubeJS recipes', async () => {
      const { fetchKubeJSRecipes } = await import('./fetch-kubejs-recipes.js')
      await fetchKubeJSRecipes()
    })
  } else {
    console.log('\n[3/5 Fetch KubeJS recipes] SKIPPED')
  }

  // Step 4: Build sprite sheet
  if (!SKIP_SPRITES) {
    await step('4/5 Build sprite sheet', async () => {
      const { buildSpriteSheet } = await import('./build-sprite-sheet.js')
      await buildSpriteSheet()
    })
  } else {
    console.log('\n[4/5 Build sprite sheet] SKIPPED')
  }

  // Step 5: Normalize data
  await step('5/5 Normalize data', async () => {
    const { normalizeData } = await import('./normalize-data.js')
    await normalizeData()
  })

  console.log('\n=== Pipeline complete ===')
  console.log('Run `npm run dev` to start the app.')
}

run().catch(err => {
  console.error('\nPipeline failed:', err)
  process.exit(1)
})
