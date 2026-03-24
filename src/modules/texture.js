import * as THREE from 'three'
import { state } from './state.js'

export const vCanvas = document.createElement('canvas')
vCanvas.width = 1024
vCanvas.height = 1433
export const ctx = vCanvas.getContext('2d')

export let logoImage = new Image()
export let stickerMaterial = null

export function setStickerMaterial(mat) {
  stickerMaterial = mat
}

export function setLogoImage(img) {
  logoImage = img
}

export function applyMaterialEffect() {
  if (!stickerMaterial) return
  if (state.currentMaterial === 'matte') {
    stickerMaterial.roughness = 0.9; stickerMaterial.metalness = 0.1; stickerMaterial.emissive.set(0x000000)
  } else if (state.currentMaterial === 'glossy') {
    stickerMaterial.roughness = 0.15; stickerMaterial.metalness = 0.1; stickerMaterial.emissive.set(0x000000)
  } else if (state.currentMaterial === 'reflective') {
    stickerMaterial.roughness = 0.4; stickerMaterial.metalness = 0.8
    stickerMaterial.emissiveMap = stickerMaterial.map
    stickerMaterial.emissive.set(0x666666); stickerMaterial.emissiveIntensity = 0.7
  }
}

export function renderTexture(id, renderer) {
  state.currentStyleId = id
  ctx.clearRect(0, 0, 1024, 1433)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const { offsets, COLORS, scaleLogo, scaleText, scaleNum, customNum, customText, customSubText, selectedFont } = state
  const font = selectedFont || 'Sarabun'

  const drawL = (x, y, s) => {
    const nx = x + offsets.logo.x, ny = y + offsets.logo.y, sz = s * scaleLogo
    ctx.beginPath(); ctx.arc(nx, ny, sz / 2, 0, Math.PI * 2)
    ctx.fillStyle = 'white'; ctx.fill()
    if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
      ctx.drawImage(logoImage, nx - sz / 2, ny - sz / 2, sz, sz)
    }
  }

  const drawT = (str, x, y, sz, col, w, type) => {
    let s = sz, nx = x, ny = y
    if (type === 'num') { s = sz * scaleNum; nx += offsets.num.x; ny += offsets.num.y }
    else { s = sz * scaleText; nx += offsets.text.x; ny += offsets.text.y }
    ctx.font = `${w} ${s}px "${font}"`; ctx.fillStyle = col; ctx.fillText(str, nx, ny)
  }

  const drawSub = (x, y) => {
    if (!customSubText) return
    const ny = y + offsets.text.y, nx = x + offsets.text.x
    ctx.font = `500 ${56 * scaleText}px "${font}"`; ctx.fillStyle = COLORS.dark
    ctx.fillText(customSubText, nx, ny)
  }

  const cX = 512

  switch (id) {
    case 1: drawL(cX,400,400); drawT(customText,cX,730,80,COLORS.dark,'bold','text'); drawSub(cX,820); drawT(customNum,cX,1020,160,COLORS.red,'900','num'); break
    case 2: drawL(cX,400,400); drawT(customText,cX,730,80,COLORS.green,'bold','text'); drawSub(cX,820); drawT('NO. '+customNum,cX,1020,140,COLORS.green,'900','num'); break
    case 3: drawL(250,700,350); ctx.textAlign='left'; drawT(customText,480,680,80,COLORS.dark,'bold','text'); drawSub(480,780); drawT('# '+customNum,480,880,140,COLORS.red,'900','num'); break
    case 4: drawL(cX,350,400); drawT(customText,cX,700,80,COLORS.dark,'bold','text'); drawSub(cX,790); ctx.beginPath(); ctx.arc(cX+offsets.num.x,1020+offsets.num.y,180*scaleNum,0,Math.PI*2); ctx.fillStyle=COLORS.green; ctx.fill(); drawT(customNum,cX,1020,160,COLORS.white,'900','num'); break
    case 5: { const r=200*scaleNum; ctx.beginPath(); ctx.roundRect(cX-r,700-r*0.6,r*2,r*1.2,40); ctx.fillStyle=COLORS.dark; ctx.fill(); drawL(cX,350,400); drawT(customNum,cX,700,120,COLORS.white,'900','num'); drawT(customText,cX,1000,80,COLORS.dark,'bold','text'); drawSub(cX,1090) } break
    case 6: ctx.fillStyle=COLORS.green; ctx.fillRect(cX-400,680,800,12); drawL(cX,400,400); drawT(customText,cX,760,80,COLORS.dark,'bold','text'); drawSub(cX,850); drawT(customNum,cX,1070,160,COLORS.red,'900','num'); break
    case 7: drawL(cX,280,280); drawT(customText,cX,600,70,COLORS.dark,'bold','text'); drawSub(cX,690); drawT(customNum,cX,1070,220,COLORS.red,'900','num'); break
    case 8: drawT(customNum,cX,250,180,COLORS.red,'900','num'); drawL(cX,580,320); drawT(customText,cX,860,80,COLORS.dark,'bold','text'); drawSub(cX,950); break
    case 9: { const bh=260*scaleNum; ctx.fillStyle=COLORS.dark; ctx.fillRect(cX+offsets.num.x-220,890+offsets.num.y-bh/2,440,bh); drawL(cX,380,360); drawT(customText,cX,710,80,COLORS.dark,'bold','text'); drawSub(cX,800); drawT(customNum,cX,890,160,COLORS.white,'900','num') } break
    case 10: ctx.textAlign='left'; drawL(200,420,360); drawT(customText,160,730,80,COLORS.dark,'bold','text'); drawSub(160,820); drawT(customNum,160,1000,160,COLORS.red,'900','num'); break
    case 11: ctx.textAlign='right'; drawL(824,420,360); drawT(customText,864,730,80,COLORS.dark,'bold','text'); drawSub(864,820); drawT(customNum,864,1000,160,COLORS.red,'900','num'); break
    case 12: { const r2=300*scaleLogo; ctx.save(); ctx.translate(cX+offsets.logo.x,716+offsets.logo.y); for(let i=0;i<60;i++){const a=(i/60)*Math.PI*2-Math.PI/2; ctx.fillStyle=COLORS.dark; ctx.font=`bold ${22*scaleText}px "${font}"`; const ch=customText[i%customText.length]; ctx.save(); ctx.translate(Math.cos(a)*r2,Math.sin(a)*r2); ctx.rotate(a+Math.PI/2); ctx.fillText(ch,0,0); ctx.restore()} ctx.restore(); drawL(cX,716,300); drawT(customNum,cX,1100,150,COLORS.red,'900','num') } break
    case 13: drawL(cX,380,380); drawT(customText,cX,700,80,COLORS.dark,'bold','text'); drawSub(cX,790); drawT(customNum,cX,1020,160,COLORS.red,'900','num'); break
    case 14: drawL(cX,500,500); drawT(customText,cX,950,70,COLORS.dark,'bold','text'); drawT(customNum,cX,1100,150,COLORS.green,'900','num'); break
    case 15: drawT(customNum,cX,820,220,COLORS.red+'44','900','num'); drawL(cX,780,380); drawT(customText,cX,410,80,COLORS.dark,'bold','text'); drawSub(cX,500); break
    case 16: drawL(cX,380,340); drawT(customText,cX,720,100,COLORS.dark,'900','text'); drawSub(cX,820); drawT(customNum,cX,1020,160,COLORS.red,'900','num'); break
    case 17: ctx.fillStyle=COLORS.white; ctx.fillRect(0,0,1024,1433); ctx.strokeStyle=COLORS.green; ctx.lineWidth=30; ctx.strokeRect(40,40,944,1353); drawL(cX,400,380); drawT(customText,cX,730,80,COLORS.dark,'bold','text'); drawSub(cX,820); drawT(customNum,cX,1020,160,COLORS.red,'900','num'); break
    case 18: drawL(cX,350,200); drawT(customText,cX,640,80,COLORS.dark,'bold','text'); drawSub(cX,730); drawT(customNum,cX,1070,200,COLORS.red,'900','num'); break
    case 19: ctx.strokeStyle=COLORS.dark; ctx.lineWidth=8; ctx.strokeRect(60,280,904,880); ctx.strokeRect(60,280,904,180); drawL(cX,370,280); drawT(customText,cX,830,80,COLORS.dark,'bold','text'); drawSub(cX,920); drawT(customNum,cX,1080,140,COLORS.red,'900','num'); break
    case 20: ctx.fillStyle='#c8c8c8'; ctx.fillRect(80,260,864,920); ctx.fillStyle='#e8e8e8'; ctx.fillRect(100,280,824,880); drawL(cX,430,380); drawT(customText,cX,760,80,COLORS.dark,'bold','text'); drawSub(cX,850); drawT(customNum,cX,1040,160,COLORS.red,'900','num'); break
    default: drawL(cX,400,400); drawT(customText,cX,730,80,COLORS.dark,'bold','text'); drawSub(cX,820); drawT(customNum,cX,1020,160,COLORS.red,'900','num'); break
  }

  if (stickerMaterial && renderer) {
    const tex = new THREE.CanvasTexture(vCanvas)
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    stickerMaterial.map = tex
    applyMaterialEffect()
    stickerMaterial.needsUpdate = true
  }
}
