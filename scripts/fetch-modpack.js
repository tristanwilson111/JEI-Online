/**
 * fetch-modpack.js
 *
 * Downloads the latest ATM10 server pack from CurseForge.
 * Output: cache/atm10-server.zip
 *
 * Requires env var: CURSEFORGE_API_KEY
 * If unset, falls back to the hardcoded forgecdn.net URL of the last known release.
 */

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const CACHE_DIR = path.resolve('cache')
const OUTPUT_PATH = path.join(CACHE_DIR, 'atm10-server.zip')

// ATM10 CurseForge project ID
const ATM10_PROJECT_ID = 925200

// Hardcoded fallback: ATM10 ServerFiles-6.1.zip (March 2026) for Minecraft 1.21.1
// File ID 7722634 is the additional/server file of the 6.1 release (project 925200).
// Direct edge.forgecdn.net URL resolved from: /api/v1/mods/925200/files/7722634/download
// Update file ID + path when a newer server pack is released.
const FALLBACK_URL =
  'https://edge.forgecdn.net/files/7722/634/ServerFiles-6.1.zip?api-key=267C6CA3'

async function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = new URL(url)
    const req = https.request(
      { hostname: options.hostname, path: options.pathname + options.search, headers },
      res => {
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            reject(new Error(`Failed to parse JSON from ${url}: ${data.slice(0, 200)}`))
          }
        })
      }
    )
    req.on('error', reject)
    req.end()
  })
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const follow = (u) => {
      https.get(u, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close()
          return follow(res.headers.location)
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} downloading ${u}`))
          return
        }
        const total = parseInt(res.headers['content-length'] || '0', 10)
        let downloaded = 0
        let lastPct = -1
        res.on('data', chunk => {
          downloaded += chunk.length
          if (total > 0) {
            const pct = Math.floor((downloaded / total) * 100)
            if (pct !== lastPct && pct % 10 === 0) {
              process.stdout.write(`\r  ${pct}%`)
              lastPct = pct
            }
          }
        })
        res.pipe(file)
        file.on('finish', () => {
          process.stdout.write('\n')
          file.close(resolve)
        })
      }).on('error', reject)
    }
    follow(url)
  })
}

async function getLatestServerPackUrl(apiKey) {
  console.log('  Fetching file list from CurseForge API...')
  const data = await fetchJson(
    `https://api.curseforge.com/v1/mods/${ATM10_PROJECT_ID}/files?pageSize=50&sortField=5&sortOrder=desc`,
    { 'x-api-key': apiKey, 'Accept': 'application/json' }
  )

  const files = data.data ?? []
  // Find the latest ServerFiles release
  const serverFile = files.find(f =>
    f.fileName && f.fileName.toLowerCase().includes('serverfiles')
  )

  if (!serverFile) {
    throw new Error('No ServerFiles release found in CurseForge API response')
  }

  console.log(`  Found: ${serverFile.fileName} (id: ${serverFile.id})`)
  return serverFile.downloadUrl
}

export async function fetchModpack() {
  fs.mkdirSync(CACHE_DIR, { recursive: true })

  if (fs.existsSync(OUTPUT_PATH)) {
    const stat = fs.statSync(OUTPUT_PATH)
    if (stat.size > 1_000_000) {
      console.log(`  Using cached server pack: ${OUTPUT_PATH} (${(stat.size / 1e6).toFixed(0)} MB)`)
      return OUTPUT_PATH
    }
  }

  let downloadUrl = FALLBACK_URL
  const apiKey = process.env.CURSEFORGE_API_KEY

  if (apiKey) {
    try {
      downloadUrl = await getLatestServerPackUrl(apiKey)
    } catch (err) {
      console.warn(`  CurseForge API failed (${err.message}), using fallback URL`)
    }
  } else {
    console.log('  CURSEFORGE_API_KEY not set — using hardcoded fallback URL')
    console.log(`  URL: ${downloadUrl}`)
  }

  console.log(`  Downloading server pack...`)
  await downloadFile(downloadUrl, OUTPUT_PATH)

  const stat = fs.statSync(OUTPUT_PATH)
  console.log(`  Downloaded: ${(stat.size / 1e6).toFixed(0)} MB → ${OUTPUT_PATH}`)
  return OUTPUT_PATH
}
