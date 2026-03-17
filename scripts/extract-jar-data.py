#!/usr/bin/env python3
"""
extract-jar-data.py

Extracts item names, recipes, and textures from all mod JARs in the ATM10 server pack.

Usage:
    python3 scripts/extract-jar-data.py

Input:  cache/server/mods/*.jar  (unzipped server pack)
Output:
    cache/lang/<modid>.json          -- item display names
    cache/recipes/<modid>/**/*.json  -- recipe JSON files
    cache/textures/<modid>/item/*.png
    cache/textures/<modid>/block/*.png
"""

import json
import os
import sys
import zipfile
from pathlib import Path

CACHE_DIR = Path("cache")
SERVER_DIR = CACHE_DIR / "server"
MODS_DIR = SERVER_DIR / "mods"

LANG_OUT = CACHE_DIR / "lang"
RECIPES_OUT = CACHE_DIR / "recipes"
TEXTURES_OUT = CACHE_DIR / "textures"


def extract_jar(jar_path: Path):
    """Extract relevant data from a single mod JAR file."""
    try:
        with zipfile.ZipFile(jar_path, 'r') as zf:
            names = zf.namelist()

            for name in names:
                # -- Lang files: assets/<modid>/lang/en_us.json
                if name.endswith('/lang/en_us.json') and name.startswith('assets/'):
                    parts = name.split('/')
                    if len(parts) >= 4:
                        modid = parts[1]
                        out_path = LANG_OUT / f"{modid}.json"
                        if not out_path.exists():
                            out_path.parent.mkdir(parents=True, exist_ok=True)
                            with zf.open(name) as f:
                                try:
                                    data = json.load(f)
                                    with open(out_path, 'w', encoding='utf-8') as out:
                                        json.dump(data, out, ensure_ascii=False, indent=2)
                                except (json.JSONDecodeError, UnicodeDecodeError):
                                    pass  # Skip malformed lang files

                # -- Recipe files: data/<modid>/recipes/**/*.json
                elif name.startswith('data/') and '/recipes/' in name and name.endswith('.json'):
                    parts = name.split('/')
                    if len(parts) >= 4:
                        modid = parts[1]
                        # Preserve subdirectory structure
                        rel = '/'.join(parts[3:])  # skip "data/<modid>/recipes/"
                        out_path = RECIPES_OUT / modid / rel
                        if not out_path.exists():
                            out_path.parent.mkdir(parents=True, exist_ok=True)
                            try:
                                data = zf.read(name)
                                with open(out_path, 'wb') as out:
                                    out.write(data)
                            except Exception:
                                pass

                # -- Item textures: assets/<modid>/textures/item/*.png
                elif (name.startswith('assets/') and
                      '/textures/item/' in name and
                      name.endswith('.png')):
                    parts = name.split('/')
                    if len(parts) >= 5:
                        modid = parts[1]
                        filename = parts[-1]
                        out_path = TEXTURES_OUT / modid / "item" / filename
                        if not out_path.exists():
                            out_path.parent.mkdir(parents=True, exist_ok=True)
                            try:
                                with open(out_path, 'wb') as out:
                                    out.write(zf.read(name))
                            except Exception:
                                pass

                # -- Block textures: assets/<modid>/textures/block/*.png
                elif (name.startswith('assets/') and
                      '/textures/block/' in name and
                      name.endswith('.png')):
                    parts = name.split('/')
                    if len(parts) >= 5:
                        modid = parts[1]
                        filename = parts[-1]
                        out_path = TEXTURES_OUT / modid / "block" / filename
                        if not out_path.exists():
                            out_path.parent.mkdir(parents=True, exist_ok=True)
                            try:
                                with open(out_path, 'wb') as out:
                                    out.write(zf.read(name))
                            except Exception:
                                pass

    except zipfile.BadZipFile:
        print(f"  Skipping bad ZIP: {jar_path.name}", file=sys.stderr)
    except Exception as e:
        print(f"  Error processing {jar_path.name}: {e}", file=sys.stderr)


def main():
    if not MODS_DIR.exists():
        print(f"ERROR: {MODS_DIR} not found. Run fetch-modpack.js and unzip first.", file=sys.stderr)
        sys.exit(1)

    LANG_OUT.mkdir(parents=True, exist_ok=True)
    RECIPES_OUT.mkdir(parents=True, exist_ok=True)
    TEXTURES_OUT.mkdir(parents=True, exist_ok=True)

    jars = sorted(MODS_DIR.glob("*.jar"))
    total = len(jars)
    print(f"  Processing {total} JAR files...")

    for i, jar in enumerate(jars, 1):
        print(f"  [{i}/{total}] {jar.name}", end='\r')
        extract_jar(jar)

    print(f"\n  Done. Extracted data to cache/lang/, cache/recipes/, cache/textures/")

    # Summary
    lang_count = len(list(LANG_OUT.glob("*.json")))
    recipe_count = sum(1 for _ in RECIPES_OUT.rglob("*.json"))
    tex_count = sum(1 for _ in TEXTURES_OUT.rglob("*.png"))
    print(f"  Lang files:    {lang_count}")
    print(f"  Recipe files:  {recipe_count}")
    print(f"  Textures:      {tex_count}")


if __name__ == "__main__":
    main()
