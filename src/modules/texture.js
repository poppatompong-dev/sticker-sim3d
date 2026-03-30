import * as THREE from 'three'
import { state } from './state.js'

export const vCanvas = document.createElement('canvas')
vCanvas.width = 1024
vCanvas.height = 1433
export const ctx = vCanvas.getContext('2d')

export let logoImage = new Image()
export let stickerMaterial = null
export let lastRenderSpec = null

export function setStickerMaterial(mat) {
  stickerMaterial = mat
}

export function setLogoImage(img) {
  logoImage = img
}

export function getRenderSpec() {
  return lastRenderSpec
}

export function applyMaterialEffect() {
  if (!stickerMaterial) return
  stickerMaterial.color.set(0xffffff)
  stickerMaterial.emissiveMap = null
  stickerMaterial.emissive.set(0x000000)
  stickerMaterial.emissiveIntensity = 0
  stickerMaterial.metalness = 0.1
  stickerMaterial.roughness = 0.85
  stickerMaterial.envMapIntensity = 1
  if (state.currentMaterial === 'matte') {
    stickerMaterial.roughness = 0.92
    stickerMaterial.metalness = 0.02
    stickerMaterial.envMapIntensity = 0.6
  } else if (state.currentMaterial === 'glossy') {
    stickerMaterial.roughness = 0.2
    stickerMaterial.metalness = 0.04
    stickerMaterial.envMapIntensity = 1.15
  } else if (state.currentMaterial === 'reflective') {
    stickerMaterial.roughness = 0.32
    stickerMaterial.metalness = 0.08
    stickerMaterial.emissive.set(0x1f1f1f)
    stickerMaterial.emissiveIntensity = 0.18
    stickerMaterial.envMapIntensity = 1.35
  }
}

// Safe rendering bounds (canvas is 1024 × 1433)
const CW = 1024, CH = 1433
const SAFE_X_PAD = 48   // horizontal margin from canvas edge
const SAFE_MAX_W = CW - SAFE_X_PAD * 2  // 928px max text width
const SAFE_Y_MIN = 40, SAFE_Y_MAX = CH - 40

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
function clampY(y) { return Math.max(SAFE_Y_MIN, Math.min(SAFE_Y_MAX, y)) }

function normalizeBounds(x, y, width, height) {
  return {
    x: +x.toFixed(1),
    y: +y.toFixed(1),
    width: +width.toFixed(1),
    height: +height.toFixed(1),
  }
}

function boundsFromAlignedText(anchorX, anchorY, width, fontSize, align) {
  const left = align === 'left'
    ? anchorX
    : align === 'right'
      ? anchorX - width
      : anchorX - width / 2
  return normalizeBounds(left, anchorY - fontSize / 2, width, fontSize)
}

function clampAlignedTextX(anchorX, width, align) {
  if (align === 'left') return clamp(anchorX, SAFE_X_PAD, CW - SAFE_X_PAD - width)
  if (align === 'right') return clamp(anchorX, SAFE_X_PAD + width, CW - SAFE_X_PAD)
  return clamp(anchorX, SAFE_X_PAD + width / 2, CW - SAFE_X_PAD - width / 2)
}

export function renderTexture(id, renderer) {
  state.currentStyleId = id
  ctx.clearRect(0, 0, CW, CH)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const { offsets, COLORS, scaleLogo, scaleText, scaleNum, customNum, customText, subTexts, selectedFont } = state
  const font = selectedFont || 'Sarabun'

  const renderSpec = {
    templateId: id,
    canvas: {
      width: CW,
      height: CH,
      safeArea: {
        x: SAFE_X_PAD,
        y: SAFE_Y_MIN,
        width: SAFE_MAX_W,
        height: SAFE_Y_MAX - SAFE_Y_MIN,
      },
    },
    controls: {
      scaleLogo,
      scaleText,
      scaleNum,
      offsets: {
        logo: { ...offsets.logo },
        text: { ...offsets.text },
        num: { ...offsets.num },
      },
      font,
      material: state.currentMaterial,
      cabinetColor: state.cabinetColor,
      colors: { ...COLORS },
    },
    elements: [],
    shapes: [],
  }

  const pushElement = (element) => {
    renderSpec.elements.push(element)
    return element
  }

  const pushShape = (shape) => {
    renderSpec.shapes.push(shape)
    return shape
  }

  const fitText = (str, weight, requestedSize) => {
    let effectiveSize = requestedSize
    ctx.font = `${weight} ${effectiveSize}px "${font}"`
    let measuredWidth = ctx.measureText(str).width
    if (measuredWidth > SAFE_MAX_W) {
      effectiveSize = Math.max(12, Math.floor(requestedSize * (SAFE_MAX_W / measuredWidth)))
      ctx.font = `${weight} ${effectiveSize}px "${font}"`
      measuredWidth = ctx.measureText(str).width
    }
    return { effectiveSize, measuredWidth }
  }

  const drawL = (x, y, s) => {
    const sz = s * scaleLogo
    const nx = clamp(x + offsets.logo.x, SAFE_X_PAD + sz / 2, CW - SAFE_X_PAD - sz / 2)
    const ny = clampY(y + offsets.logo.y)
    ctx.beginPath(); ctx.arc(nx, ny, sz / 2, 0, Math.PI * 2)
    ctx.fillStyle = 'white'; ctx.fill()
    if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
      ctx.drawImage(logoImage, nx - sz / 2, ny - sz / 2, sz, sz)
    }
    pushElement({
      type: 'logo',
      center: { x: +nx.toFixed(1), y: +ny.toFixed(1) },
      bounds: normalizeBounds(nx - sz / 2, ny - sz / 2, sz, sz),
      requestedSizePx: +sz.toFixed(1),
      effectiveSizePx: +sz.toFixed(1),
      source: logoImage?.currentSrc || logoImage?.src || '',
    })
  }

  const drawT = (str, x, y, sz, col, w, type) => {
    let requestedSize = sz, nx = x, ny = y
    if (type === 'num') { requestedSize = sz * scaleNum; nx += offsets.num.x; ny += offsets.num.y }
    else { requestedSize = sz * scaleText; nx += offsets.text.x; ny += offsets.text.y }
    ny = clampY(ny)
    const align = ctx.textAlign
    const text = String(str)
    const { effectiveSize, measuredWidth } = fitText(text, w, requestedSize)
    nx = clampAlignedTextX(nx, measuredWidth, align)
    ctx.font = `${w} ${effectiveSize}px "${font}"`
    ctx.fillStyle = col
    ctx.fillText(text, nx, ny, SAFE_MAX_W)
    pushElement({
      type: type === 'num' ? 'number' : 'mainText',
      text,
      color: col,
      weight: w,
      alignment: align,
      anchor: { x: +nx.toFixed(1), y: +ny.toFixed(1) },
      bounds: boundsFromAlignedText(nx, ny, measuredWidth, effectiveSize, align),
      requestedFontSizePx: +requestedSize.toFixed(1),
      effectiveFontSizePx: +effectiveSize.toFixed(1),
      maxWidthPx: SAFE_MAX_W,
    })
  }

  const drawSub = (x, y) => {
    let offsetY = 0
    subTexts.forEach((entry, index) => {
      if (!entry.text) return
      const ny = clampY(y + offsets.text.y + offsetY)
      const requestedSize = entry.fontSize * scaleText
      const { effectiveSize, measuredWidth } = fitText(entry.text, '500', requestedSize)
      const align = ctx.textAlign
      const nx = clampAlignedTextX(x + offsets.text.x, measuredWidth, align)
      ctx.font = `500 ${effectiveSize}px "${font}"`
      ctx.fillStyle = entry.color || COLORS.dark
      ctx.fillText(entry.text, nx, ny, SAFE_MAX_W)
      pushElement({
        type: 'subText',
        index,
        text: entry.text,
        color: entry.color || COLORS.dark,
        weight: '500',
        alignment: align,
        anchor: { x: +nx.toFixed(1), y: +ny.toFixed(1) },
        bounds: boundsFromAlignedText(nx, ny, measuredWidth, effectiveSize, align),
        requestedFontSizePx: +requestedSize.toFixed(1),
        effectiveFontSizePx: +effectiveSize.toFixed(1),
        maxWidthPx: SAFE_MAX_W,
      })
      offsetY += effectiveSize + 10
    })
  }

  const cX = 512

  switch (id) {
    case 1: drawL(cX, 400, 400); drawT(customText, cX, 730, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 820); drawT(customNum, cX, 1020, 160, COLORS.red, '900', 'num'); break
    case 2: drawL(cX, 400, 400); drawT(customText, cX, 730, 80, COLORS.green, 'bold', 'text'); drawSub(cX, 820); drawT('NO. ' + customNum, cX, 1020, 140, COLORS.green, '900', 'num'); break
    case 3: drawL(250, 700, 350); ctx.textAlign = 'left'; drawT(customText, 480, 680, 80, COLORS.dark, 'bold', 'text'); drawSub(480, 780); drawT('# ' + customNum, 480, 880, 140, COLORS.red, '900', 'num'); break
    case 4: {
      drawL(cX, 350, 400); drawT(customText, cX, 700, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 790)
      const radius = 180 * scaleNum
      const centerX = clamp(cX + offsets.num.x, SAFE_X_PAD + radius, CW - SAFE_X_PAD - radius)
      const centerY = clampY(1020 + offsets.num.y)
      ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.fillStyle = COLORS.green; ctx.fill()
      pushShape({ type: 'circleBadge', color: COLORS.green, center: { x: +centerX.toFixed(1), y: +centerY.toFixed(1) }, radiusPx: +radius.toFixed(1), bounds: normalizeBounds(centerX - radius, centerY - radius, radius * 2, radius * 2) })
      drawT(customNum, cX, 1020, 160, COLORS.white, '900', 'num')
    } break
    case 5: {
      const r = 200 * scaleNum
      const rectX = clamp(cX - r, SAFE_X_PAD, CW - SAFE_X_PAD - r * 2)
      const rectY = clampY(700 - r * 0.6)
      ctx.beginPath(); ctx.roundRect(rectX, rectY, r * 2, r * 1.2, 40); ctx.fillStyle = COLORS.dark; ctx.fill()
      pushShape({ type: 'roundedRect', color: COLORS.dark, bounds: normalizeBounds(rectX, rectY, r * 2, r * 1.2), radiusPx: 40 })
      drawL(cX, 350, 400); drawT(customNum, cX, 700, 120, COLORS.white, '900', 'num'); drawT(customText, cX, 1000, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 1090)
    } break
    case 6:
      ctx.fillStyle = COLORS.green; ctx.fillRect(cX - 400, 680, 800, 12)
      pushShape({ type: 'divider', color: COLORS.green, bounds: normalizeBounds(cX - 400, 680, 800, 12) })
      drawL(cX, 400, 400); drawT(customText, cX, 760, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 850); drawT(customNum, cX, 1070, 160, COLORS.red, '900', 'num'); break
    case 7: drawL(cX, 280, 280); drawT(customText, cX, 600, 70, COLORS.dark, 'bold', 'text'); drawSub(cX, 690); drawT(customNum, cX, 1070, 220, COLORS.red, '900', 'num'); break
    case 8: drawT(customNum, cX, 250, 180, COLORS.red, '900', 'num'); drawL(cX, 580, 320); drawT(customText, cX, 860, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 950); break
    case 9: {
      const bh = 260 * scaleNum
      const rectX = clamp(cX + offsets.num.x - 220, SAFE_X_PAD, CW - SAFE_X_PAD - 440)
      const rectY = clampY(890 + offsets.num.y - bh / 2)
      ctx.fillStyle = COLORS.dark; ctx.fillRect(rectX, rectY, 440, bh)
      pushShape({ type: 'numberPanel', color: COLORS.dark, bounds: normalizeBounds(rectX, rectY, 440, bh) })
      drawL(cX, 380, 360); drawT(customText, cX, 710, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 800); drawT(customNum, cX, 890, 160, COLORS.white, '900', 'num')
    } break
    case 10: ctx.textAlign = 'left'; drawL(200, 420, 360); drawT(customText, 160, 730, 80, COLORS.dark, 'bold', 'text'); drawSub(160, 820); drawT(customNum, 160, 1000, 160, COLORS.red, '900', 'num'); break
    case 11: ctx.textAlign = 'right'; drawL(824, 420, 360); drawT(customText, 864, 730, 80, COLORS.dark, 'bold', 'text'); drawSub(864, 820); drawT(customNum, 864, 1000, 160, COLORS.red, '900', 'num'); break
    case 12: {
      const radius = 300 * scaleLogo
      const centerX = clamp(cX + offsets.logo.x, SAFE_X_PAD + radius, CW - SAFE_X_PAD - radius)
      const centerY = clampY(716 + offsets.logo.y)
      const requestedSize = 22 * scaleText
      ctx.save(); ctx.translate(centerX, centerY)
      for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2 - Math.PI / 2; ctx.fillStyle = COLORS.dark; ctx.font = `bold ${requestedSize}px "${font}"`; const ch = customText[i % customText.length]; ctx.save(); ctx.translate(Math.cos(a) * radius, Math.sin(a) * radius); ctx.rotate(a + Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore() }
      ctx.restore()
      pushElement({ type: 'curvedText', text: customText, color: COLORS.dark, weight: 'bold', center: { x: +centerX.toFixed(1), y: +centerY.toFixed(1) }, radiusPx: +radius.toFixed(1), requestedFontSizePx: +requestedSize.toFixed(1), effectiveFontSizePx: +requestedSize.toFixed(1), bounds: normalizeBounds(centerX - radius, centerY - radius, radius * 2, radius * 2) })
      drawL(cX, 716, 300); drawT(customNum, cX, 1100, 150, COLORS.red, '900', 'num')
    } break
    case 13: drawL(cX, 380, 380); drawT(customText, cX, 700, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 790); drawT(customNum, cX, 1020, 160, COLORS.red, '900', 'num'); break
    case 14: drawL(cX, 500, 500); drawT(customText, cX, 950, 70, COLORS.dark, 'bold', 'text'); drawT(customNum, cX, 1100, 150, COLORS.green, '900', 'num'); break
    case 15: drawT(customNum, cX, 820, 220, COLORS.red + '44', '900', 'num'); drawL(cX, 780, 380); drawT(customText, cX, 410, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 500); break
    case 16: drawL(cX, 380, 340); drawT(customText, cX, 720, 100, COLORS.dark, '900', 'text'); drawSub(cX, 820); drawT(customNum, cX, 1020, 160, COLORS.red, '900', 'num'); break
    case 17:
      ctx.fillStyle = COLORS.white; ctx.fillRect(0, 0, 1024, 1433)
      ctx.strokeStyle = COLORS.green; ctx.lineWidth = 30; ctx.strokeRect(40, 40, 944, 1353)
      pushShape({ type: 'fullBackground', color: COLORS.white, bounds: normalizeBounds(0, 0, 1024, 1433) })
      pushShape({ type: 'frame', color: COLORS.green, bounds: normalizeBounds(40, 40, 944, 1353), strokeWidthPx: 30 })
      drawL(cX, 400, 380); drawT(customText, cX, 730, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 820); drawT(customNum, cX, 1020, 160, COLORS.red, '900', 'num'); break
    case 18: drawL(cX, 350, 200); drawT(customText, cX, 640, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 730); drawT(customNum, cX, 1070, 200, COLORS.red, '900', 'num'); break
    case 19:
      ctx.strokeStyle = COLORS.dark; ctx.lineWidth = 8; ctx.strokeRect(60, 280, 904, 880); ctx.strokeRect(60, 280, 904, 180)
      pushShape({ type: 'outerGridFrame', color: COLORS.dark, bounds: normalizeBounds(60, 280, 904, 880), strokeWidthPx: 8 })
      pushShape({ type: 'topGridFrame', color: COLORS.dark, bounds: normalizeBounds(60, 280, 904, 180), strokeWidthPx: 8 })
      drawL(cX, 370, 280); drawT(customText, cX, 830, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 920); drawT(customNum, cX, 1080, 140, COLORS.red, '900', 'num'); break
    case 20:
      ctx.fillStyle = '#c8c8c8'; ctx.fillRect(80, 260, 864, 920)
      ctx.fillStyle = '#e8e8e8'; ctx.fillRect(100, 280, 824, 880)
      pushShape({ type: 'plateBase', color: '#c8c8c8', bounds: normalizeBounds(80, 260, 864, 920) })
      pushShape({ type: 'plateInner', color: '#e8e8e8', bounds: normalizeBounds(100, 280, 824, 880) })
      drawL(cX, 430, 380); drawT(customText, cX, 760, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 850); drawT(customNum, cX, 1040, 160, COLORS.red, '900', 'num'); break
    default: drawL(cX, 400, 400); drawT(customText, cX, 730, 80, COLORS.dark, 'bold', 'text'); drawSub(cX, 820); drawT(customNum, cX, 1020, 160, COLORS.red, '900', 'num'); break
  }

  lastRenderSpec = renderSpec

  if (stickerMaterial && renderer) {
    const tex = new THREE.CanvasTexture(vCanvas)
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    stickerMaterial.map = tex
    applyMaterialEffect()
    stickerMaterial.needsUpdate = true
  }

  return renderSpec
}
