<template>
  <div class="flex-1 overflow-hidden flex flex-col bg-white">
    <div class="p-4 border-b border-gray-200 bg-white flex flex-col gap-3 shadow-sm z-10">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-800">3D Mockup Preview</h1>
            <p class="text-sm text-gray-500">เลือกรูปแบบจากกริดด้านล่าง แล้วดูผลแบบเรียลไทม์</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">{{ currentStyleLabel }}</span>
            <button @click="templatePanelOpen = !templatePanelOpen"
              class="text-xs font-medium text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg border border-gray-200 transition-all select-none">
              {{ templatePanelOpen ? '▲ ซ่อน' : '▼ เลือกแบบ' }}
            </button>
          </div>
        </div>
        <div v-show="templatePanelOpen" class="grid gap-1.5 transition-all" style="grid-template-columns: repeat(auto-fill, minmax(52px, 1fr))">
          <div
            v-for="s in styles" :key="s.id"
            class="relative"
            @mouseenter="showTooltip($event, s)"
            @mouseleave="hoveredStyle = null"
          >
            <button
              @click="selectStyle(s.id)"
              :class="[
                'w-full aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-between p-1 transition-all',
                state.currentStyleId === s.id
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
              ]"
            >
              <svg viewBox="0 0 20 28" class="w-full flex-1" xmlns="http://www.w3.org/2000/svg" v-html="styleOutlines[s.id] || styleOutlines[1]"></svg>
              <span :class="['text-[9px] font-bold leading-none mt-0.5', state.currentStyleId === s.id ? 'text-green-700' : 'text-gray-500']">{{ s.id }}</span>
            </button>
          </div>
        </div>
        <!-- Tooltip rendered outside grid to avoid overflow clipping -->
        <Teleport to="body">
          <div
            v-if="hoveredStyle"
            class="fixed z-[9999] w-52 bg-white rounded-lg shadow-xl border border-gray-200 p-3 pointer-events-none"
            :style="tooltipPos"
          >
            <div class="text-xs font-bold text-gray-800 mb-1">{{ hoveredStyle.name }}</div>
            <div class="text-[10px] text-gray-500 mb-1.5">{{ hoveredStyle.desc }}</div>
            <div class="text-[10px] text-green-700 font-medium leading-snug">{{ hoveredStyle.useCase }}</div>
          </div>
        </Teleport>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            v-for="m in viewModes" :key="m.id"
            @click="setMode(m.id)"
            :class="[
              'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
              state.viewMode === m.id
                ? 'bg-white text-green-700 shadow border border-green-300'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >{{ m.label }}</button>
        </div>
        <template v-if="state.viewMode !== 1">
          <label class="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" :checked="state.showHuman" @change="toggleHuman" class="accent-green-600 w-3.5 h-3.5">
            <span class="text-xs text-gray-600">แสดงรูปคน</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" :checked="state.showGround" @change="toggleGround" class="accent-green-600 w-3.5 h-3.5">
            <span class="text-xs text-gray-600">พื้นอ้างอิง</span>
          </label>
        </template>
        <span v-else class="text-xs text-gray-400">หมุน / ซูม / ตรวจสัดส่วนแบบจำลองได้จากหน้าพรีวิวโดยตรง</span>
      </div>
    </div>

    <div class="flex-1 min-h-0 flex flex-col relative bg-gray-100">
      <div class="px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
        <div class="text-sm font-bold text-gray-800">3D Mockup <span class="text-xs font-normal text-gray-400 ml-1">Canvas2D + Three.js</span></div>
        <div class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">🖱️ ลาก / 📜 ซูม</div>
      </div>
      <div class="relative flex-1 min-h-0">
        <div id="loading">กำลังโหลดโมเดล 3 มิติ...</div>
        <div ref="canvasContainer" class="canvas-container absolute inset-0"></div>
        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-center pointer-events-none">
          <div class="text-xs font-bold text-[#008542]">ตู้หมายเลข</div>
          <div class="text-2xl font-black text-red-600 tracking-wider leading-none">{{ state.customNum }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { initScene, getRenderer, switchViewMode, setHumanVisible, setGroundVisible } from '../modules/scene.js'
import { renderTexture, setLogoImage } from '../modules/texture.js'
import { state, styles } from '../modules/state.js'

const canvasContainer = ref(null)
const templatePanelOpen = ref(false)
const hoveredStyle = ref(null)
const tooltipPos = ref({})

const currentStyleLabel = computed(() => {
  const s = styles.find(s => s.id === state.currentStyleId)
  return s ? s.name : ''
})

// Color legend: #22c55e=logo(green) #6b7280=text(gray) #ef4444=number(red) #008542=accent #b0b5b9=cabinet
const styleOutlines = {
  1:  `<circle cx="10" cy="7" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="14" width="14" height="2" rx="1" fill="#9ca3af"/><rect x="5" y="19" width="10" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  2:  `<circle cx="10" cy="7" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="14" width="14" height="2" rx="1" fill="#bbf7d0"/><rect x="5" y="19" width="10" height="4" rx="1" fill="#bbf7d0" stroke="#008542" stroke-width="0.8"/>`,
  3:  `<circle cx="5" cy="13" r="3.5" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="10" y="10" width="9" height="2" rx="1" fill="#9ca3af"/><rect x="10" y="14" width="7" height="2" rx="1" fill="#d1d5db"/><rect x="10" y="19" width="9" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  4:  `<circle cx="10" cy="7" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="14" width="14" height="2" rx="1" fill="#9ca3af"/><circle cx="10" cy="22" r="4" fill="#fecaca" stroke="#ef4444" stroke-width="1.2"/>`,
  5:  `<circle cx="10" cy="7" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="13" width="14" height="5" rx="2" fill="#374151" opacity=".7"/><rect x="5" y="13.5" width="10" height="4" rx="1" fill="#fecaca"/><rect x="3" y="21" width="14" height="2" rx="1" fill="#9ca3af"/>`,
  6:  `<circle cx="10" cy="7" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="2" y="13" width="16" height="1.5" rx="0.5" fill="#008542"/><rect x="3" y="16" width="14" height="2" rx="1" fill="#9ca3af"/><rect x="5" y="21" width="10" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  7:  `<circle cx="10" cy="5" r="3" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="4" y="10" width="12" height="2" rx="1" fill="#9ca3af"/><rect x="2" y="14" width="16" height="9" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  8:  `<rect x="2" y="2" width="16" height="7" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/><circle cx="10" cy="15" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="21" width="14" height="2" rx="1" fill="#9ca3af"/>`,
  9:  `<circle cx="10" cy="7" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="13" width="14" height="2" rx="1" fill="#9ca3af"/><rect x="4" y="17" width="12" height="8" rx="1" fill="#374151" opacity=".7"/><rect x="6" y="18" width="8" height="6" rx="0.5" fill="#fecaca"/>`,
  10: `<circle cx="5" cy="8" r="3.5" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="2" y="14" width="12" height="2" rx="1" fill="#9ca3af"/><rect x="2" y="19" width="10" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  11: `<circle cx="15" cy="8" r="3.5" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="6" y="14" width="12" height="2" rx="1" fill="#9ca3af"/><rect x="8" y="19" width="10" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  12: `<circle cx="10" cy="13" r="9" fill="none" stroke="#22c55e" stroke-width="1" stroke-dasharray="2,1.5"/><circle cx="10" cy="13" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="6" y="23" width="8" height="3" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.7"/>`,
  13: `<circle cx="10" cy="7" r="4.5" fill="#dcfce7" stroke="#22c55e" stroke-width="1.4"/><rect x="3" y="14" width="14" height="2" rx="1" fill="#9ca3af"/><rect x="5" y="19" width="10" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  14: `<circle cx="10" cy="10" r="5.5" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="4" y="20" width="12" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  15: `<rect x="2" y="10" width="16" height="11" rx="1" fill="#e5e7eb" opacity=".8"/><circle cx="10" cy="14" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="4" width="14" height="2" rx="1" fill="#9ca3af"/><rect x="4" y="22" width="12" height="3" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.7"/>`,
  16: `<circle cx="10" cy="7" r="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="2" y="14" width="16" height="3.5" rx="1" fill="#374151" opacity=".6"/><rect x="3" y="14.5" width="14" height="2.5" rx="0.5" fill="#9ca3af" opacity=".5"/><rect x="4" y="20" width="12" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  17: `<rect x="1" y="1" width="18" height="26" rx="1" fill="white" stroke="#008542" stroke-width="1.5"/><circle cx="10" cy="8" r="3.5" fill="#dcfce7" stroke="#22c55e" stroke-width="1"/><rect x="4" y="14" width="12" height="2" rx="1" fill="#9ca3af"/><rect x="5" y="19" width="10" height="4" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  18: `<circle cx="10" cy="6" r="2.5" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="3" y="11" width="14" height="2" rx="1" fill="#9ca3af"/><rect x="1" y="15" width="18" height="10" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.8"/>`,
  19: `<rect x="2" y="5" width="16" height="19" rx="1" fill="none" stroke="#6b7280" stroke-width="1.2"/><rect x="2" y="5" width="16" height="5" rx="1" fill="#e5e7eb" stroke="#6b7280" stroke-width="1"/><circle cx="10" cy="7.5" r="2" fill="#22c55e"/><rect x="4" y="14" width="12" height="2" rx="1" fill="#9ca3af"/><rect x="5" y="19" width="10" height="3" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.7"/>`,
  20: `<rect x="2" y="4" width="16" height="20" rx="1" fill="#d1d5db"/><rect x="3" y="5" width="14" height="18" rx="1" fill="#e5e7eb"/><circle cx="10" cy="11" r="3" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2"/><rect x="4" y="17" width="12" height="2" rx="1" fill="#9ca3af"/><rect x="5" y="21" width="10" height="2" rx="1" fill="#fecaca" stroke="#ef4444" stroke-width="0.7"/>`,
}

function showTooltip(event, style) {
  const rect = event.currentTarget.getBoundingClientRect()
  const tooltipW = 208
  let left = rect.left + rect.width / 2 - tooltipW / 2
  if (left < 8) left = 8
  if (left + tooltipW > window.innerWidth - 8) left = window.innerWidth - 8 - tooltipW
  tooltipPos.value = {
    top: (rect.top - 8) + 'px',
    left: left + 'px',
    transform: 'translateY(-100%)',
  }
  hoveredStyle.value = style
}

const viewModes = [
  { id: 1, label: '🔍 3D Preview' },
  { id: 2, label: '📏 Scale View' },
  { id: 3, label: '👁 Eye Level' },
]

function selectStyle(id) {
  renderTexture(id, getRenderer())
}

function setMode(mode) {
  state.viewMode = mode
  switchViewMode(mode)
  if (mode !== 1) {
    setHumanVisible(state.showHuman)
    setGroundVisible(state.showGround)
  }
}

function toggleHuman(e) {
  state.showHuman = e.target.checked
  setHumanVisible(state.showHuman)
}

function toggleGround(e) {
  state.showGround = e.target.checked
  setGroundVisible(state.showGround)
}

onMounted(() => {
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      initScene(canvasContainer.value)
      renderTexture(state.currentStyleId, getRenderer())
      document.getElementById('loading').style.display = 'none'
    })
  })

  const logoImage = new Image()
  logoImage.crossOrigin = 'Anonymous'
  logoImage.onload = () => {
    setLogoImage(logoImage)
    renderTexture(state.currentStyleId, getRenderer())
  }
  logoImage.onerror = () => {
    if (logoImage.src.endsWith('/logo.png')) {
      logoImage.src = 'https://img1.pic.in.th/images/118819.png'
    }
  }
  logoImage.src = '/logo.png'
})
</script>
