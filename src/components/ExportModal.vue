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
        <div class="grid grid-cols-5 gap-6">
          <div class="col-span-2 bg-white rounded-lg p-4 border flex justify-center items-center">
            <div class="w-full rounded p-3 flex justify-center items-center" :style="{ backgroundColor: state.cabinetColor }">
              <img :src="previewSrc" class="max-w-full max-h-[320px] drop-shadow-lg" alt="Preview">
            </div>
          </div>
          <div class="col-span-3 flex flex-col gap-3">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
              <span class="text-2xl">🏷️</span>
              <div>
                <span class="text-xs text-gray-500">ตู้หมายเลข</span>
                <div class="text-2xl font-black text-red-600 tracking-wider">{{ state.customNum }}</div>
              </div>
            </div>
            <div class="bg-white rounded-lg border p-3 text-xs text-gray-700 grid grid-cols-2 gap-y-1.5 gap-x-4">
              <span class="font-medium text-gray-500">รูปแบบ</span><span class="font-bold">{{ styleName }}</span>
              <span class="font-medium text-gray-500">วัสดุ</span><span class="font-bold capitalize">{{ state.currentMaterial }}</span>
              <span class="font-medium text-gray-500">ฟอนต์</span><span class="font-bold">{{ state.selectedFont }}</span>
              <span class="font-medium text-gray-500">ข้อความหลัก</span><span class="font-bold">{{ state.customText }}</span>
            </div>
          </div>
        </div>

        <!-- A) Design Spec -->
        <section class="bg-white rounded-lg border p-5">
          <h3 class="font-bold text-blue-800 border-b-2 border-blue-800 pb-2 mb-4 text-sm">A) Design Specification</h3>
          <div class="grid grid-cols-2 gap-6 text-xs text-gray-700">
            <div>
              <h4 class="font-bold text-gray-800 mb-2">ขนาด (Dimensions)</h4>
              <table class="w-full text-left">
                <tbody>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">สติกเกอร์</td><td class="py-1 font-bold">2.2 × 3.1 ม. (1024×1433 px)</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">ตราสัญลักษณ์</td><td class="py-1 font-bold">Ø {{ (10 * state.scaleLogo).toFixed(1) }} ซม.</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">ข้อความหลัก</td><td class="py-1 font-bold">{{ (2.5 * state.scaleText).toFixed(1) }} ซม.</td></tr>
                  <tr><td class="py-1 text-gray-500">หมายเลข</td><td class="py-1 font-bold">{{ (5.0 * state.scaleNum).toFixed(1) }} ซม.</td></tr>
                </tbody>
              </table>
            </div>
            <div>
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
          <div v-if="state.subTexts.some(s => s.text)" class="mt-4 text-xs">
            <h4 class="font-bold text-gray-800 mb-1.5">ข้อความรอง</h4>
            <div v-for="(st, i) in state.subTexts.filter(s => s.text)" :key="i" class="flex items-center gap-3 py-1 border-b border-gray-100">
              <span class="text-gray-500 w-4">{{ i + 1 }}.</span>
              <span class="font-bold flex-1">{{ st.text }}</span>
              <span class="text-gray-400">{{ st.fontSize }}px</span>
              <div class="w-4 h-4 rounded border" :style="{ backgroundColor: st.color }"></div>
              <span class="font-mono text-gray-500">{{ st.color }}</span>
            </div>
          </div>
        </section>

        <!-- B) Architectural Details -->
        <section class="bg-white rounded-lg border p-5">
          <h3 class="font-bold text-blue-800 border-b-2 border-blue-800 pb-2 mb-4 text-sm">B) Architectural Details</h3>
          <div class="text-xs text-gray-700 grid grid-cols-2 gap-6">
            <div>
              <h4 class="font-bold text-gray-800 mb-2">โครงสร้างและตำแหน่ง</h4>
              <table class="w-full text-left">
                <tbody>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">เสา</td><td class="py-1 font-bold">สูง 7.0 ม., Ø 18–22 ซม.</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">ตู้</td><td class="py-1 font-bold">2.6 × 3.6 × 1.1 ม.</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">จุดศูนย์กลางตู้</td><td class="py-1 font-bold">ความสูง {{ CAB_CENTER_M.toFixed(2) }} ม. จากพื้น</td></tr>
                  <tr><td class="py-1 text-gray-500">ลำโพง</td><td class="py-1 font-bold">2 ตัว สูง 5.6 ม., กาง 150°</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 class="font-bold text-gray-800 mb-2">สภาพแวดล้อม</h4>
              <ul class="flex flex-col gap-1 text-gray-600">
                <li>• ตู้ติดตั้งริมถนนหรือพื้นที่สาธารณะ</li>
                <li>• ต้องมองเห็นหมายเลขจากระยะ 20–50 ม.</li>
                <li>• สติกเกอร์ต้องทนแดด/ฝนได้</li>
                <li>• ควรติดตั้งด้านที่มีผู้สัญจรมากที่สุด</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- C) Engineering Details -->
        <section class="bg-white rounded-lg border p-5">
          <h3 class="font-bold text-blue-800 border-b-2 border-blue-800 pb-2 mb-4 text-sm">C) Engineering Details</h3>
          <div class="text-xs text-gray-700 grid grid-cols-2 gap-6">
            <div>
              <h4 class="font-bold text-gray-800 mb-2">การติดตั้ง</h4>
              <table class="w-full text-left">
                <tbody>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">แขนยึดตู้</td><td class="py-1 font-bold">0.36 × 0.28 × 1.1 ม. ที่ {{ (CAB_CENTER_M - 1.8 - 0.14).toFixed(2) }} ม.</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">สีตู้</td><td class="py-1 font-bold font-mono">{{ state.cabinetColor }}</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">วัสดุสติกเกอร์</td><td class="py-1 font-bold capitalize">{{ materialSuggestion }}</td></tr>
                  <tr><td class="py-1 text-gray-500">สเกลอ้างอิง</td><td class="py-1 font-bold">1 หน่วย 3D = 0.583 ม.</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 class="font-bold text-gray-800 mb-2">พิกัดประกอบ (Three.js units)</h4>
              <table class="w-full text-left">
                <tbody>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">พื้น (Ground)</td><td class="py-1 font-mono">y = –6.0</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">เสา (Pole)</td><td class="py-1 font-mono">y = 0, h = 12</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">ตู้ (Cabinet)</td><td class="py-1 font-mono">y = {{ CAB_CENTER_Y_DISPLAY }}, z = 1.1</td></tr>
                  <tr class="border-b border-gray-100"><td class="py-1 text-gray-500">สติกเกอร์</td><td class="py-1 font-mono">2.2 × 3.1, z = 0.558</td></tr>
                  <tr><td class="py-1 text-gray-500">ลำโพง</td><td class="py-1 font-mono">y = 5.6, ∠150°</td></tr>
                </tbody>
              </table>
            </div>
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
          <button @click="() => window.print()" class="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-green-700 transition">🖨️ บันทึก PDF</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { state, styles } from '../modules/state.js'
import { vCanvas, renderTexture } from '../modules/texture.js'
import { getRenderer, CAB_CENTER_M } from '../modules/scene.js'

const props = defineProps({ show: Boolean })
defineEmits(['close'])

const copied = ref(false)
const previewSrc = ref('')

watch(() => props.show, (visible) => {
  if (visible) {
    renderTexture(state.currentStyleId, getRenderer())
    previewSrc.value = vCanvas.toDataURL()
  } else {
    previewSrc.value = ''
  }
})

const CAB_CENTER_Y_DISPLAY = (-6 + 3.0 * (12 / 7) + 1.8).toFixed(2)

const styleName = computed(() => styles.find(s => s.id === state.currentStyleId)?.name ?? '')
const styleObj = computed(() => styles.find(s => s.id === state.currentStyleId))

const colorSpec = computed(() => [
  { label: 'ข้อความหลัก', hex: state.COLORS.dark },
  { label: 'หมายเลข', hex: state.COLORS.red },
  { label: 'สีเน้น/กรอบ', hex: state.COLORS.green },
  { label: 'สีตู้', hex: state.cabinetColor },
])

const materialSuggestion = computed(() => {
  const m = state.currentMaterial
  if (m === 'matte') return 'Matte vinyl — ทนแดด 3–5 ปี'
  if (m === 'glossy') return 'Glossy vinyl — เงาสะท้อนแสง'
  return 'Reflective vinyl — สะท้อนแสงกลางคืน'
})

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function buildJsonSpec() {
  return {
    project: 'ติดตั้งสติกเกอร์ตู้',
    cabinetNumber: state.customNum,
    design: {
      templateId: state.currentStyleId,
      templateName: styleObj.value?.name ?? '',
      material: state.currentMaterial,
      font: state.selectedFont,
      mainText: state.customText,
      subTexts: state.subTexts.filter(s => s.text).map(s => ({ text: s.text, fontSize: s.fontSize, color: s.color })),
    },
    dimensions: {
      stickerM: '2.2 × 3.1',
      stickerPx: '1024 × 1433',
      logoDiameterCm: +(10 * state.scaleLogo).toFixed(1),
      textHeightCm: +(2.5 * state.scaleText).toFixed(1),
      numberHeightCm: +(5.0 * state.scaleNum).toFixed(1),
    },
    colors: {
      mainText: state.COLORS.dark,
      number: state.COLORS.red,
      accent: state.COLORS.green,
      cabinet: state.cabinetColor,
    },
    architecture: {
      poleHeightM: 7.0,
      poleDiameterCm: '18–22',
      cabinetM: '2.6 × 3.6 × 1.1',
      cabinetCenterHeightM: +CAB_CENTER_M.toFixed(2),
      speakerHeightM: 5.6,
      speakerSpreadDeg: 150,
    },
    engineering: {
      bracketM: '0.36 × 0.28 × 1.1',
      bracketHeightM: +(CAB_CENTER_M - 1.8 - 0.14).toFixed(2),
      scaleRef: '1 unit = 0.583 m',
      coordinates: {
        ground: 'y = -6.0',
        pole: 'y = 0, h = 12',
        cabinet: 'y = 4.4, z = 1.1',
        sticker: '2.2 × 3.1, z = 0.558',
        speakers: 'y = 5.6, ∠150°',
      },
    },
  }
}

async function copyJson() {
  const json = JSON.stringify(buildJsonSpec(), null, 2)
  await navigator.clipboard.writeText(json)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}
</script>
