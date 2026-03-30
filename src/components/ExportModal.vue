<template>
  <div id="export-modal" v-if="show" class="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-6">
    <div id="print-area" class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col relative">

      <!-- Header -->
      <div class="p-6 border-b flex justify-between items-end bg-white">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Production Specification Sheet</h2>
          <p class="text-sm text-gray-500">โครงการติดตั้งสติกเกอร์ตู้ — {{ state.customText }}</p>
        </div>
        <img src="/logo.png" class="h-14" alt="Logo" @error="e => e.target.src='https://img1.pic.in.th/images/118819.png'">
      </div>

      <div class="p-6 flex flex-col gap-6 bg-gray-50 flex-1">

        <!-- Preview + Quick Info -->
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-8 grid grid-cols-2 gap-4">
            <div class="bg-white rounded-lg p-4 border flex flex-col gap-2">
              <div class="text-xs font-bold text-gray-700">ภาพสติกเกอร์</div>
              <div class="flex-1 rounded px-2 py-1 flex justify-center items-center min-h-[340px]" :style="{ backgroundColor: state.cabinetColor }">
                <img :src="previewSrc" class="max-w-full max-h-[320px] w-auto h-auto drop-shadow-lg scale-110" alt="Sticker Preview">
              </div>
            </div>
            <div class="bg-white rounded-lg p-4 border flex flex-col gap-2">
              <div class="text-xs font-bold text-gray-700">ภาพตัวอย่างบนตู้จำลอง</div>
              <div class="flex-1 rounded overflow-hidden bg-gradient-to-b from-sky-100 to-slate-100 flex justify-center items-center min-h-[340px] p-1">
                <img v-if="modelPreviewSrc" :src="modelPreviewSrc" class="w-full h-[320px] object-contain scale-[1.55]" alt="Cabinet Mockup Preview">
                <div v-else class="text-xs text-gray-400 py-10">ไม่พบภาพตู้จำลอง</div>
              </div>
            </div>
          </div>
          <div class="col-span-4 flex flex-col gap-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <span class="text-2xl">🏷️</span>
              <div>
                <span class="text-xs text-gray-500">ตู้หมายเลข</span>
                <div class="text-3xl font-black text-red-600 tracking-wider leading-none">{{ state.customNum }}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-white rounded-lg border p-3 flex flex-col gap-1 min-h-[72px]">
                <span class="text-gray-500">รูปแบบ</span>
                <span class="font-bold text-gray-800">{{ styleName }}</span>
                <span class="font-mono text-[11px] text-gray-400">#{{ state.currentStyleId }}</span>
              </div>
              <div class="bg-white rounded-lg border p-3 flex flex-col gap-1 min-h-[72px]">
                <span class="text-gray-500">ฟอนต์</span>
                <span class="font-bold text-gray-800">{{ state.selectedFont }}</span>
              </div>
              <div class="bg-white rounded-lg border p-3 flex flex-col gap-1 min-h-[72px] col-span-2">
                <span class="text-gray-500">ข้อความหลัก</span>
                <span class="font-bold text-gray-800 leading-snug">{{ state.customText }}</span>
              </div>
              <div class="bg-white rounded-lg border p-3 flex flex-col gap-1 min-h-[88px] col-span-2">
                <span class="text-gray-500">วัสดุ (ข้อเสนอแนะ)</span>
                <span class="font-bold text-gray-800 leading-snug">{{ materialRecommendation }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- A) Design Spec -->
        <section class="bg-white rounded-lg border p-5">
          <h3 class="font-bold text-blue-800 border-b-2 border-blue-800 pb-2 mb-4 text-sm">A) Design Specification</h3>
          <div class="grid grid-cols-2 gap-4 text-xs text-gray-700">
            <div class="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <h4 class="font-bold text-gray-800 mb-2">ขนาดและตำแหน่ง</h4>
              <table class="w-full text-left text-[11px]">
                <tbody>
                  <tr class="border-b border-gray-100 text-gray-500">
                    <td class="py-1 pr-2">องค์ประกอบ</td>
                    <td class="py-1 pr-2">ขนาดอ้างอิง</td>
                    <td class="py-1 pr-2">Scale</td>
                    <td class="py-1">Offset</td>
                  </tr>
                  <tr v-for="item in placementRows" :key="item.key" class="border-b border-gray-100 align-top">
                    <td class="py-1.5 pr-2 font-medium text-gray-700">{{ item.label }}</td>
                    <td class="py-1.5 pr-2 font-mono text-gray-600">{{ item.sizeLabel }}</td>
                    <td class="py-1.5 pr-2 font-mono text-gray-600">{{ item.scale.toFixed(2) }}</td>
                    <td class="py-1.5 font-mono text-gray-600">{{ formatPoint(item.offset) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <h4 class="font-bold text-gray-800 mb-2">🎨 รหัสสี</h4>
              <div class="flex flex-col gap-1.5">
                <div v-for="c in colorSpec" :key="c.label" class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded border border-gray-300" :style="{ backgroundColor: c.hex }"></div>
                  <span class="text-gray-500 w-20">{{ c.label }}</span>
                  <span class="font-mono font-bold">{{ c.hex }}</span>
                  <span class="text-gray-400 font-mono">{{ hexToRgb(c.hex) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 leading-relaxed">
            <div class="font-bold mb-1">แนวทางพิจารณาประเภทวัสดุ</div>
            <div>
              ให้เลือกประเภทวัสดุโดยพิจารณา <span class="font-bold">ความคงทนในการใช้งานจริง</span> และ <span class="font-bold">ความชัดเจนในการมองเห็น/อ่านง่าย/สังเกตได้ง่าย</span> เป็นหลัก โดยค่าที่เลือกในระบบนี้เป็นข้อเสนอแนะของงานออกแบบเพื่อใช้ประกอบการตัดสินใจผลิต
            </div>
          </div>
          <div v-if="renderElements.length" class="mt-4 text-xs">
            <h4 class="font-bold text-gray-800 mb-1.5">Rendered elements (อ้างอิงผลิต)</h4>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-[11px]">
                <thead>
                  <tr class="border-b border-gray-200 text-gray-500">
                    <th class="py-1 pr-2">ชนิด</th>
                    <th class="py-1 pr-2">ข้อมูล</th>
                    <th class="py-1 pr-2">สี</th>
                    <th class="py-1 pr-2">ขนาดจริง</th>
                    <th class="py-1 pr-2">Anchor</th>
                    <th class="py-1">Bounds</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(el, i) in renderElements" :key="i" class="border-b border-gray-100 align-top">
                    <td class="py-1.5 pr-2 font-bold text-gray-700">{{ elementLabel(el.type) }}</td>
                    <td class="py-1.5 pr-2">
                      <div class="font-medium text-gray-800">{{ el.text || '—' }}</div>
                      <div v-if="el.index !== undefined" class="text-gray-400">ลำดับ {{ el.index + 1 }}</div>
                    </td>
                    <td class="py-1.5 pr-2 font-mono text-gray-600">{{ el.color || '—' }}</td>
                    <td class="py-1.5 pr-2 text-gray-600">{{ formatElementSize(el) }}</td>
                    <td class="py-1.5 pr-2 font-mono text-gray-600">{{ formatPoint(el.anchor || el.center) }}</td>
                    <td class="py-1.5 font-mono text-gray-600">{{ formatBounds(el.bounds) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="renderSubTextElements.length" class="mt-4 text-xs">
            <h4 class="font-bold text-gray-800 mb-1.5">ข้อความรอง</h4>
            <div v-for="(st, i) in renderSubTextElements" :key="i" class="flex items-center gap-3 py-1.5 border-b border-gray-100">
              <span class="text-gray-500 w-4">{{ i + 1 }}.</span>
              <span class="font-bold flex-1">{{ st.text }}</span>
              <span class="text-gray-400">{{ formatElementSize(st) }}</span>
              <div class="w-4 h-4 rounded border" :style="{ backgroundColor: st.color }"></div>
              <span class="font-mono text-gray-500">{{ st.color }}</span>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-lg border p-5">
          <h3 class="font-bold text-blue-800 border-b-2 border-blue-800 pb-2 mb-4 text-sm">B) Current Control Values</h3>
          <div class="grid grid-cols-2 gap-4 text-xs text-gray-700">
            <div class="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <h4 class="font-bold text-gray-800 mb-2">ภาพรวมการ render</h4>
              <table class="w-full text-left">
                <tbody>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">Canvas</td><td class="py-1 font-mono text-gray-700">{{ renderCanvasSpec.width }} × {{ renderCanvasSpec.height }} px</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">Safe area</td><td class="py-1 font-mono text-gray-700">{{ formatBounds(renderCanvasSpec.safeArea) }}</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">จำนวนองค์ประกอบ</td><td class="py-1 font-mono text-gray-700">{{ renderElements.length }}</td></tr>
                  <tr><td class="py-1 text-gray-500">จำนวน shape</td><td class="py-1 font-mono text-gray-700">{{ renderShapes.length }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <h4 class="font-bold text-gray-800 mb-2">Template shapes</h4>
              <div v-if="renderShapes.length" class="flex flex-col gap-1.5 text-[11px]">
                <div v-for="(shape, i) in renderShapes" :key="i" class="border border-gray-100 rounded px-2 py-1.5">
                  <div class="font-bold text-gray-700">{{ shape.type }}</div>
                  <div class="font-mono text-gray-500">{{ formatBounds(shape.bounds) }}</div>
                  <div class="font-mono text-gray-400">{{ shape.color }}</div>
                </div>
              </div>
              <div v-else class="text-gray-400">ไม่มี shape พิเศษใน template นี้</div>
            </div>
          </div>
        </section>

        <section class="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-xs text-amber-900 leading-relaxed">
          <div class="font-bold mb-1">หมายเหตุ</div>
          <div>
            รายละเอียดต่าง ๆ ในเอกสารฉบับนี้อาจปรับเปลี่ยนได้ตามความเหมาะสม ทั้งนี้ต้องเป็นไปตามข้อกำหนดที่เกี่ยวข้อง และต้องได้รับความยินยอมจากเทศบาลก่อนดำเนินการ
          </div>
        </section>
      </div>

      <!-- Action Bar -->
      <div class="p-5 bg-white border-t flex justify-between items-center no-print">
        <span v-if="copied" class="text-xs text-green-600 font-medium">✓ คัดลอก JSON แล้ว</span>
        <span v-else></span>
        <div class="flex gap-3">
          <button @click="copyJson" class="px-4 py-2.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition">📋 คัดลอก JSON</button>
          <button @click="$emit('close')" class="px-5 py-2.5 bg-gray-200 text-sm font-bold rounded-lg hover:bg-gray-300 transition">กลับไปแก้ไข</button>
          <button @click="handlePrint" class="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-green-700 transition">🖨️ บันทึก PDF</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { state, styles } from '../modules/state.js'
import { vCanvas, renderTexture, getRenderSpec } from '../modules/texture.js'
import { getRenderer } from '../modules/scene.js'

const props = defineProps({ show: Boolean })
defineEmits(['close'])

const copied = ref(false)
const previewSrc = ref('')
const modelPreviewSrc = ref('')
const renderSpec = ref(null)

watch(() => props.show, (visible) => {
  if (visible) {
    renderSpec.value = renderTexture(state.currentStyleId, getRenderer()) ?? getRenderSpec()
    previewSrc.value = vCanvas.toDataURL()
    const renderer = getRenderer()
    modelPreviewSrc.value = renderer?.domElement?.toDataURL?.('image/png') ?? ''
  } else {
    previewSrc.value = ''
    modelPreviewSrc.value = ''
    renderSpec.value = null
  }
})

const styleName = computed(() => styles.find(s => s.id === state.currentStyleId)?.name ?? '')
const styleObj = computed(() => styles.find(s => s.id === state.currentStyleId))
const renderCanvasSpec = computed(() => renderSpec.value?.canvas ?? { safeArea: { width: 0, height: 0 } })
const renderControlSpec = computed(() => renderSpec.value?.controls ?? { offsets: {} })
const renderElements = computed(() => renderSpec.value?.elements ?? [])
const renderShapes = computed(() => renderSpec.value?.shapes ?? [])
const renderSubTextElements = computed(() => renderElements.value.filter(el => el.type === 'subText'))
const placementRows = computed(() => [
  {
    key: 'logo',
    label: 'ตราสัญลักษณ์',
    scale: renderControlSpec.value.scaleLogo ?? 0,
    sizeLabel: `Ø ${(10 * (renderControlSpec.value.scaleLogo ?? 0)).toFixed(1)} ซม.`,
    offset: renderControlSpec.value.offsets?.logo,
  },
  {
    key: 'text',
    label: 'ข้อความหลัก',
    scale: renderControlSpec.value.scaleText ?? 0,
    sizeLabel: `${(2.5 * (renderControlSpec.value.scaleText ?? 0)).toFixed(1)} ซม.`,
    offset: renderControlSpec.value.offsets?.text,
  },
  {
    key: 'num',
    label: 'หมายเลขตู้',
    scale: renderControlSpec.value.scaleNum ?? 0,
    sizeLabel: `${(5.0 * (renderControlSpec.value.scaleNum ?? 0)).toFixed(1)} ซม.`,
    offset: renderControlSpec.value.offsets?.num,
  },
])

const colorSpec = computed(() => [
  { label: 'ข้อความหลัก', hex: state.COLORS.dark },
  { label: 'หมายเลข', hex: state.COLORS.red },
  { label: 'สีเน้น/กรอบ', hex: state.COLORS.green },
  { label: 'สีตู้', hex: state.cabinetColor },
])

const materialRecommendation = computed(() => {
  if (state.currentMaterial === 'matte') return 'ผิวด้าน — เหมาะเมื่อเน้นความทนทานและลดแสงสะท้อน'
  if (state.currentMaterial === 'glossy') return 'ผิวมัน — เหมาะเมื่อเน้นความสดของสีและความเด่นชัดในระยะมองทั่วไป'
  return 'สะท้อนแสง — เหมาะเมื่อเน้นการสังเกตเห็นง่ายและการอ่านชัดในสภาพแสงน้อย'
})

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function formatPoint(point) {
  if (!point) return '—'
  return `x=${Number(point.x).toFixed(1)}, y=${Number(point.y).toFixed(1)}`
}

function formatBounds(bounds) {
  if (!bounds) return '—'
  return `x=${bounds.x}, y=${bounds.y}, w=${bounds.width}, h=${bounds.height}`
}

function formatElementSize(element) {
  if (element?.requestedFontSizePx) {
    return `${element.requestedFontSizePx}px → ${element.effectiveFontSizePx}px`
  }
  if (element?.requestedSizePx) {
    return `${element.effectiveSizePx}px`
  }
  if (element?.radiusPx) {
    return `r=${element.radiusPx}px`
  }
  return '—'
}

function elementLabel(type) {
  if (type === 'logo') return 'Logo'
  if (type === 'mainText') return 'Main text'
  if (type === 'subText') return 'Sub text'
  if (type === 'number') return 'Number'
  if (type === 'curvedText') return 'Curved text'
  return type
}

function buildJsonSpec() {
  const snapshot = renderSpec.value ?? getRenderSpec()
  return {
    project: 'ติดตั้งสติกเกอร์ตู้',
    cabinetNumber: state.customNum,
    design: {
      templateId: state.currentStyleId,
      templateName: styleObj.value?.name ?? '',
      material: state.currentMaterial,
      font: state.selectedFont,
      mainText: state.customText,
      subTexts: renderSubTextElements.value.map(s => ({
        text: s.text,
        color: s.color,
        requestedFontSizePx: s.requestedFontSizePx,
        effectiveFontSizePx: s.effectiveFontSizePx,
        anchor: s.anchor,
        bounds: s.bounds,
      })),
    },
    dimensions: {
      stickerM: '2.2 × 3.1',
      stickerPx: '1024 × 1433',
      safeAreaPx: renderCanvasSpec.value.safeArea,
    },
    colors: {
      mainText: state.COLORS.dark,
      number: state.COLORS.red,
      accent: state.COLORS.green,
      cabinet: state.cabinetColor,
    },
    productionLayout: {
      controlSnapshot: snapshot?.controls ?? null,
      canvasSnapshot: snapshot?.canvas ?? null,
      elements: snapshot?.elements ?? [],
      shapes: snapshot?.shapes ?? [],
    },
    renderSnapshot: snapshot,
  }
}

async function copyJson() {
  const json = JSON.stringify(buildJsonSpec(), null, 2)
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = json
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch (error) {
    console.error('Failed to copy JSON spec:', error)
    alert('ไม่สามารถคัดลอก JSON ได้ กรุณาลองใหม่อีกครั้ง')
  }
}

function handlePrint() {
  window.print()
}
</script>
