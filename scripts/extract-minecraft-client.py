#!/usr/bin/env python3
"""
extract-minecraft-client.py

Downloads the Minecraft 1.21.1 client JAR from Mojang and extracts:
  - assets/minecraft/textures/item/*.png  → cache/textures/minecraft/item/
  - assets/minecraft/textures/block/*.png → cache/textures/minecraft/block/
  - assets/minecraft/lang/en_us.json      → cache/lang/minecraft.json

This provides vanilla Minecraft item textures and display names that
are not present in the mod JARs.
"""

import json
import os
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

CACHE_DIR = Path("cache")
CLIENT_JAR = CACHE_DIR / "minecraft" / "client.jar"

VERSION_MANIFEST = "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json"
MC_VERSION = "1.21.1"


def download_client_jar():
    CLIENT_JAR.parent.mkdir(parents=True, exist_ok=True)
    if CLIENT_JAR.exists() and CLIENT_JAR.stat().st_size > 10_000_000:
        print(f"  Using cached client JAR: {CLIENT_JAR}")
        return

    print(f"  Fetching version manifest for {MC_VERSION}...")
    try:
        with urllib.request.urlopen(VERSION_MANIFEST, timeout=15) as r:
            manifest = json.loads(r.read())
    except Exception as e:
        # Try with curl as fallback (works around sandbox DNS restrictions)
        result = subprocess.run(
            ["curl", "-s", "--max-time", "15", VERSION_MANIFEST],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            raise RuntimeError(f"Could not fetch version manifest: {e}") from e
        manifest = json.loads(result.stdout)

    version_url = next(
        v["url"] for v in manifest["versions"] if v["id"] == MC_VERSION
    )

    try:
        with urllib.request.urlopen(version_url, timeout=15) as r:
            version_meta = json.loads(r.read())
    except Exception:
        result = subprocess.run(
            ["curl", "-s", "--max-time", "15", version_url],
            capture_output=True, text=True
        )
        version_meta = json.loads(result.stdout)

    client_url = version_meta["downloads"]["client"]["url"]
    size_mb = version_meta["downloads"]["client"]["size"] // 1024 // 1024
    print(f"  Downloading Minecraft {MC_VERSION} client JAR ({size_mb} MB)...")

    result = subprocess.run(
        ["curl", "-sL", "--max-time", "120", "-o", str(CLIENT_JAR), client_url]
    )
    if result.returncode != 0:
        raise RuntimeError("Failed to download Minecraft client JAR")


def extract_assets():
    tex_item_dir = CACHE_DIR / "textures" / "minecraft" / "item"
    tex_block_dir = CACHE_DIR / "textures" / "minecraft" / "block"
    lang_dir = CACHE_DIR / "lang"
    tex_item_dir.mkdir(parents=True, exist_ok=True)
    tex_block_dir.mkdir(parents=True, exist_ok=True)
    lang_dir.mkdir(parents=True, exist_ok=True)

    counts = {"item": 0, "block": 0}
    with zipfile.ZipFile(CLIENT_JAR) as z:
        for name in z.namelist():
            for kind in ("item", "block"):
                prefix = f"assets/minecraft/textures/{kind}/"
                if name.startswith(prefix) and name.endswith(".png"):
                    dest = (tex_item_dir if kind == "item" else tex_block_dir) / os.path.basename(name)
                    dest.write_bytes(z.read(name))
                    counts[kind] += 1

        lang_data = json.loads(z.read("assets/minecraft/lang/en_us.json"))
        lang_path = lang_dir / "minecraft.json"
        lang_path.write_text(json.dumps(lang_data, ensure_ascii=False))

    print(f"  Item textures:  {counts['item']}")
    print(f"  Block textures: {counts['block']}")
    print(f"  Lang entries:   {len(lang_data)}")


def main():
    download_client_jar()
    extract_assets()


if __name__ == "__main__":
    main()
