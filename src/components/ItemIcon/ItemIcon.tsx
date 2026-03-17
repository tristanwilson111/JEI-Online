import './ItemIcon.css'

interface ItemIconProps {
  textureKey: string
  spriteManifest: Record<string, { x: number; y: number; w: number; h: number }>
  size?: number
}

export function ItemIcon({ textureKey, spriteManifest, size = 32 }: ItemIconProps) {
  const sprite = spriteManifest[textureKey]

  if (!sprite) {
    return (
      <div
        className="item-icon item-icon--fallback"
        style={{ width: size, height: size }}
        title={textureKey}
      >
        <span className="item-icon__unknown">?</span>
      </div>
    )
  }

  const scale = size / 16
  const sheetUrl = '/data/sprites/sheet.png'

  return (
    <div
      className="item-icon"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sheetUrl})`,
        backgroundPosition: `-${sprite.x * scale}px -${sprite.y * scale}px`,
        backgroundSize: `${1024 * scale}px auto`,
        imageRendering: 'pixelated',
      }}
      title={textureKey}
    />
  )
}
