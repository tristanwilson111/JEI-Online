/**
 * fetch-kubejs-recipes.js
 *
 * Shallow-clones the ATM10 GitHub repo to get KubeJS custom recipes.
 * These are recipe modifications made in JavaScript that won't appear
 * in the mod JAR data/ directories.
 *
 * Output: cache/kubejs/  (copy of the kubejs/ directory from the ATM10 repo)
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CACHE_DIR = path.resolve('cache')
const REPO_DIR = path.join(CACHE_DIR, 'atm10-repo')
const KUBEJS_OUT = path.join(CACHE_DIR, 'kubejs')
const ATM10_REPO = 'https://github.com/AllTheMods/ATM-10.git'

export async function fetchKubeJSRecipes() {
  fs.mkdirSync(CACHE_DIR, { recursive: true })

  // Clone or update the repo
  if (fs.existsSync(path.join(REPO_DIR, '.git'))) {
    console.log('  Updating ATM10 repo...')
    execSync('git fetch origin && git reset --hard origin/main', {
      cwd: REPO_DIR,
      stdio: 'pipe',
    })
  } else {
    console.log(`  Cloning ${ATM10_REPO} (shallow)...`)
    execSync(`git clone --depth=1 ${ATM10_REPO} "${REPO_DIR}"`, {
      stdio: 'inherit',
    })
  }

  // Copy kubejs/ to cache/kubejs/
  const kubejsSrc = path.join(REPO_DIR, 'kubejs')
  if (!fs.existsSync(kubejsSrc)) {
    console.warn('  Warning: kubejs/ directory not found in ATM10 repo')
    return
  }

  if (fs.existsSync(KUBEJS_OUT)) {
    fs.rmSync(KUBEJS_OUT, { recursive: true })
  }
  fs.cpSync(kubejsSrc, KUBEJS_OUT, { recursive: true })

  const scriptCount = countFiles(KUBEJS_OUT, '.js')
  console.log(`  Copied kubejs/ (${scriptCount} script files) → ${KUBEJS_OUT}`)
}

function countFiles(dir, ext) {
  let count = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) count += countFiles(full, ext)
    else if (entry.name.endsWith(ext)) count++
  }
  return count
}
