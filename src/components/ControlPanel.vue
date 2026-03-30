<template>
  <div class="w-full md:w-[400px] h-full p-4 border-r border-gray-200 bg-gray-50 overflow-y-auto shadow-inner flex flex-col gap-5 no-scrollbar">

    <!-- Action buttons -->
    <div class="flex flex-col gap-2 pt-1">
      <button @click="$emit('open-export')" class="w-full py-3 bg-[#008542] hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow transition flex items-center justify-center gap-2">📄 ส่งออกสเปก</button>
      <button @click="resetAll" class="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 border border-red-200">🔄 รีเซ็ตทั้งหมด</button>
    </div>

    <!-- 1. ข้อมูลและวัสดุ -->
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      <h2 class="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">1. ข้อมูลและวัสดุ</h2>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">หมายเลขตู้</label>
        <input type="text" :value="state.customNum" @input="updateCustomNum($event.target.value)"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 font-black text-xl text-red-600 text-center focus:ring-2 focus:ring-green-400 focus:outline-none tracking-widest">
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">ประเภทวัสดุ</label>
        <div class="grid grid-cols-3 gap-2">
          <label class="cursor-pointer" v-for="m in materials" :key="m.val">
            <input type="radio" name="material" :value="m.val" :checked="state.currentMaterial === m.val" @change="changeMaterial(m.val)" class="peer sr-only">
            <div class="text-center text-xs py-2 rounded-lg border-2 border-gray-200 peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 font-medium transition">{{ m.label }}</div>
          </label>
        </div>
      </div>
    </section>

    <!-- 2. ข้อความ -->
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      <h2 class="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">2. ข้อความบนสติกเกอร์</h2>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">ข้อความหลัก</label>
        <input type="text" :value="state.customText" @input="updateText($event.target.value)"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none">
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <label class="block text-xs font-medium text-gray-600">ข้อความรอง</label>
          <button v-if="state.subTexts.length < 4" @click="addSubText" class="text-xs text-green-600 hover:underline font-medium">+ เพิ่ม</button>
        </div>
        <div v-for="(st, idx) in state.subTexts" :key="idx" class="bg-gray-50 rounded-lg border border-gray-200 p-2.5 flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5">
            <input type="text" :value="st.text" @input="updateSubText(idx, 'text', $event.target.value)"
              class="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-green-400 focus:outline-none"
              placeholder="เช่น กองช่าง / ฝ่ายโยธา">
            <button v-if="state.subTexts.length > 1" @click="removeSubText(idx)" class="text-red-400 hover:text-red-600 text-xs font-bold px-1">✕</button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400 w-14">ขนาด</span>
            <input type="range" min="28" max="120" step="2" :value="st.fontSize" @input="updateSubText(idx, 'fontSize', Number($event.target.value))"
              class="flex-1 h-1.5 accent-green-600">
            <span class="text-xs font-mono text-green-700 w-7 text-right">{{ st.fontSize }}</span>
            <input type="color" :value="st.color" @input="updateSubText(idx, 'color', $event.target.value)" class="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0">
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">ฟอนต์</label>
        <select :value="state.selectedFont" @change="updateFont($event.target.value)"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-green-400 focus:outline-none">
          <option v-for="f in fonts" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </div>
    </section>

    <!-- 3. สี -->
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
      <div class="flex justify-between items-center border-b border-gray-100 pb-2 mb-1">
        <h2 class="text-sm font-bold text-gray-800">3. สี</h2>
        <button @click="resetColors" class="text-xs text-blue-500 hover:underline">รีเซ็ต</button>
      </div>
      <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
        <span class="text-xs font-medium text-gray-700">สีตู้ (Cabinet)</span>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded border border-gray-300 shadow-inner" :style="{ background: state.cabinetColor }"></div>
          <input type="color" :value="state.cabinetColor" @input="updateCabinetColor($event.target.value)" class="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5">
        </div>
      </div>
      <div v-for="c in colorItems" :key="c.key" class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
        <span class="text-xs font-medium text-gray-700">{{ c.label }}</span>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded border border-gray-300 shadow-inner" :style="{ background: state.COLORS[c.key] }"></div>
          <input type="color" :value="state.COLORS[c.key]" @input="updateColor(c.key, $event.target.value)" class="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5">
        </div>
      </div>
    </section>

    <!-- 4. ขนาดและตำแหน่ง -->
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      <div class="flex justify-between items-center border-b border-gray-100 pb-2">
        <h2 class="text-sm font-bold text-gray-800">4. ขนาดและตำแหน่ง</h2>
        <button @click="resetScalesAndPositions" class="text-xs text-blue-500 hover:underline">รีเซ็ต</button>
      </div>

      <div v-for="item in scaleItems" :key="item.key" class="bg-gray-50 rounded-lg border border-gray-200 p-3 flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-700">{{ item.label }}</span>
          <span class="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">{{ scaleLabel(item.key) }}</span>
        </div>
        <!-- Scale slider with live value -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 w-8">ขนาด</span>
          <input type="range" min="0.5" max="2.0" step="0.05" :value="scaleVal(item.key)"
            @input="updateScale(item.key, $event.target.value)"
            class="flex-1 h-2 accent-green-600">
          <span class="text-xs font-mono text-green-700 w-8 text-right">{{ scaleVal(item.key).toFixed(2) }}</span>
        </div>
        <!-- X/Y position with number inputs -->
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-400">เลื่อนซ้าย/ขวา (X)</span>
            <input type="number" min="-400" max="400" step="10" :value="state.offsets[item.key].x"
              @input="updatePosition(item.key, 'x', $event.target.value)"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs text-center focus:ring-1 focus:ring-green-400 focus:outline-none">
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-400">เลื่อนขึ้น/ลง (Y)</span>
            <input type="number" min="-400" max="400" step="10" :value="state.offsets[item.key].y"
              @input="updatePosition(item.key, 'y', $event.target.value)"
              class="w-full border border-gray-300 rounded px-2 py-1 text-xs text-center focus:ring-1 focus:ring-green-400 focus:outline-none">
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { state, fonts } from '../modules/state.js'
import { renderTexture, applyMaterialEffect } from '../modules/texture.js'
import { getRenderer, setCabinetColor } from '../modules/scene.js'

const emit = defineEmits(['open-export'])

const materials = [
  { val: 'matte',      label: 'ผิวด้าน' },
  { val: 'glossy',     label: 'ผิวมัน' },
  { val: 'reflective', label: 'สะท้อนแสง' },
]

const colorItems = [
  { key: 'dark',  label: 'ข้อความหลัก' },
  { key: 'red',   label: 'หมายเลขตู้' },
  { key: 'green', label: 'สีเน้น / กรอบ' },
]

const scaleItems = [
  { key: 'logo', label: 'ตราสัญลักษณ์' },
  { key: 'text', label: 'ข้อความหลัก' },
  { key: 'num',  label: 'หมายเลขตู้' },
]

function scaleVal(key) {
  return key === 'logo' ? state.scaleLogo : key === 'text' ? state.scaleText : state.scaleNum
}

function scaleLabel(key) {
  if (key === 'logo') return `Ø ${(10 * scaleVal('logo')).toFixed(1)} ซม.`
  if (key === 'text') return `${(2.5 * scaleVal('text')).toFixed(1)} ซม.`
  return `${(5.0 * scaleVal('num')).toFixed(1)} ซม.`
}

function re() { renderTexture(state.currentStyleId, getRenderer()) }

async function ensureFontReady(fontName) {
  if (!document.fonts?.load) return
  await Promise.all([
    document.fonts.load(`400 48px "${fontName}"`),
    document.fonts.load(`700 48px "${fontName}"`),
    document.fonts.load(`900 72px "${fontName}"`),
  ])
}

function updateCustomNum(v) { state.customNum = v; re() }
function updateText(v) { state.customText = v; re() }
function updateSubText(idx, field, val) {
  state.subTexts[idx][field] = val; re()
}
function addSubText() {
  if (state.subTexts.length < 4) {
    state.subTexts.push({ text: '', fontSize: 56, color: '#1F2937' }); re()
  }
}
function removeSubText(idx) {
  state.subTexts.splice(idx, 1); re()
}
async function updateFont(v) {
  state.selectedFont = v
  re()
  try {
    await ensureFontReady(v)
    requestAnimationFrame(() => re())
  } catch {
    requestAnimationFrame(() => re())
  }
}
function updateCabinetColor(v) { state.cabinetColor = v; setCabinetColor(v) }
function changeMaterial(m) { state.currentMaterial = m; applyMaterialEffect() }
function updateColor(k, v) { state.COLORS[k] = v; re() }

function resetColors() {
  state.COLORS.green = '#008542'; state.COLORS.red = '#DC2626'; state.COLORS.dark = '#1F2937'
  state.cabinetColor = '#b0b5b9'; setCabinetColor('#b0b5b9')
  re()
}

function updateScale(t, v) {
  const f = parseFloat(v)
  if (t === 'logo') state.scaleLogo = f
  else if (t === 'text') state.scaleText = f
  else state.scaleNum = f
  re()
}

function updatePosition(t, a, v) {
  state.offsets[t][a] = parseInt(v) || 0; re()
}

function resetScalesAndPositions() {
  ;['logo', 'text', 'num'].forEach(t => { state.offsets[t] = { x: 0, y: 0 } })
  state.scaleLogo = 1.0; state.scaleText = 1.0; state.scaleNum = 1.0
  re()
}

function resetAll() {
  if (!confirm('รีเซ็ตทั้งหมด?')) return
  state.customNum = '092'
  state.customText = 'เทศบาลเมืองอุทัยธานี'
  state.subTexts = [{ text: '', fontSize: 56, color: '#1F2937' }]
  state.selectedFont = 'Sarabun'
  state.currentMaterial = 'matte'
  resetColors()
  resetScalesAndPositions()
}
</script>
