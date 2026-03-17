# ATM10 Data Pipeline

This pipeline downloads ATM10 item/recipe data from public sources and builds the static data files served by the JEI Online app.

## Quick Start

```bash
# (Optional) Set your CurseForge API key for automatic latest-version detection
export CURSEFORGE_API_KEY=your_key_here

# Run the full pipeline
npm run build:data
```

This will:
1. Download the ATM10 server pack from CurseForge (~1–2 GB)
2. Extract item names, recipes, and textures from all mod JARs
3. Clone the ATM10 GitHub repo to get KubeJS custom recipes
4. Pack all textures into a single sprite sheet
5. Output `public/data/items.json`, `public/data/recipes.json`, and `public/data/sprites/`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CURSEFORGE_API_KEY` | CurseForge API key. If omitted, uses the hardcoded URL of the last known server pack release. Get a key at https://console.curseforge.com/ |
| `SKIP_DOWNLOAD=1` | Skip downloading/unzipping the server pack (use cached `cache/server/`) |
| `SKIP_EXTRACT=1` | Skip JAR extraction (use cached `cache/lang/`, `cache/recipes/`, `cache/textures/`) |
| `SKIP_KUBEJS=1` | Skip cloning the ATM10 GitHub repo |
| `SKIP_SPRITES=1` | Skip sprite sheet generation (use cached `cache/sprites/`) |

## Partial Runs

After an initial full run, you can re-run only specific steps:

```bash
# Re-run only normalization (e.g., after fixing normalize-data.js)
SKIP_DOWNLOAD=1 SKIP_EXTRACT=1 SKIP_KUBEJS=1 SKIP_SPRITES=1 npm run build:data

# Re-run sprites + normalization (e.g., after adding new textures)
SKIP_DOWNLOAD=1 SKIP_EXTRACT=1 SKIP_KUBEJS=1 npm run build:data
```

## Cache Directory

`cache/` is gitignored (contains ~1–2 GB of downloaded data). The processed outputs in `public/data/` are committed to the repo and served to end users.

## Updating to a New ATM10 Version

1. Delete `cache/atm10-server.zip` and `cache/server/`
2. Update the `FALLBACK_URL` in `scripts/fetch-modpack.js` if needed
3. Re-run `npm run build:data`

## Requirements

- Node.js 18+
- Python 3.8+
- `unzip` (system command)
- `git` (for KubeJS repo clone)
