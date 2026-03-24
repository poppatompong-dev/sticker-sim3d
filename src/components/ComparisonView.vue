<template>
  <div class="flex-1 overflow-hidden flex flex-col bg-white">
    <div class="p-4 border-b border-gray-200 bg-white flex flex-col gap-3 shadow-sm z-10">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-800">3D Mockup Preview</h1>
          <p class="text-sm text-gray-500">ดูแบบจำลองแบบเรียลไทม์และปรับรูปแบบได้จาก dropdown</p>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">เลือกรูปแบบ</label>
          <select
            :value="state.currentStyleId"
            @change="selectStyle(Number($event.target.value))"
            class="min-w-[240px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option v-for="s in styles" :key="s.id" :value="s.id">{{ s.name }} - {{ s.desc }}</option>
          </select>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-gray-500">หมุน / ซูม / ตรวจสัดส่วนแบบจำลองได้จากหน้าพรีวิวโดยตรง</span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 bg-gray-100 no-scrollbar">
      <div class="h-full">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[640px] h-full relative">
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <div class="text-sm font-bold text-gray-800">3D Mockup</div>
              <div class="text-xs text-gray-500">แบบจำลองแบบเรียลไทม์จาก Canvas2D + Three.js</div>
            </div>
            <div class="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">Rotate / Zoom</div>
          </div>
          <div class="relative flex-1 min-h-[280px]">
            <div id="loading">กำลังโหลดโมเดล 3 มิติ...</div>
            <div ref="canvasContainer" class="canvas-container absolute inset-0"></div>
            <div class="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded text-sm text-gray-700 shadow border border-gray-200 pointer-events-none">🖱️ ลากเพื่อหมุน | 📜 ซูม</div>
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md border border-gray-200 text-center pointer-events-none">
              <div class="font-bold text-[#008542]">ตู้หมายเลข</div>
              <div class="text-3xl font-black text-red-600 tracking-wider">{{ state.customNum }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { initScene } from '../modules/scene.js'
import { renderTexture, setLogoImage } from '../modules/texture.js'
import { getRenderer } from '../modules/scene.js'
import { state, styles } from '../modules/state.js'

const canvasContainer = ref(null)

function selectStyle(id) {
  renderTexture(id, getRenderer())
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
