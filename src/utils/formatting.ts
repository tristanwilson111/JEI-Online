import React from 'react'

export const MC_COLORS: Record<string, string> = {
  '0': '#000000',
  '1': '#0000AA',
  '2': '#00AA00',
  '3': '#00AAAA',
  '4': '#AA0000',
  '5': '#AA00AA',
  '6': '#FFAA00',
  '7': '#AAAAAA',
  '8': '#555555',
  '9': '#5555FF',
  'a': '#55FF55',
  'b': '#55FFFF',
  'c': '#FF5555',
  'd': '#FF55FF',
  'e': '#FFFF55',
  'f': '#FFFFFF',
}

interface TextStyle {
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
}

export function parseFormatted(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let current = ''
  let style: TextStyle = {}
  let key = 0

  const flush = () => {
    if (current) {
      const cssStyle: React.CSSProperties = {}
      if (style.color) cssStyle.color = style.color
      if (style.bold) cssStyle.fontWeight = 'bold'
      if (style.italic) cssStyle.fontStyle = 'italic'
      const decorations: string[] = []
      if (style.underline) decorations.push('underline')
      if (style.strikethrough) decorations.push('line-through')
      if (decorations.length) cssStyle.textDecoration = decorations.join(' ')

      nodes.push(
        React.createElement('span', { key: key++, style: cssStyle }, current)
      )
      current = ''
    }
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if ((ch === '§' || ch === '\u00a7') && i + 1 < text.length) {
      flush()
      const code = text[i + 1].toLowerCase()
      i++
      if (MC_COLORS[code] !== undefined) {
        style = { ...style, color: MC_COLORS[code] }
      } else if (code === 'l') {
        style = { ...style, bold: true }
      } else if (code === 'o') {
        style = { ...style, italic: true }
      } else if (code === 'n') {
        style = { ...style, underline: true }
      } else if (code === 'm') {
        style = { ...style, strikethrough: true }
      } else if (code === 'r') {
        style = {}
      }
    } else {
      current += ch
    }
  }
  flush()
  return nodes
}

export function stripFormatting(text: string): string {
  return text.replace(/[§\u00a7][0-9a-fk-or]/gi, '')
}
