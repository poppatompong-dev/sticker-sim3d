<template>
  <div id="export-modal" v-if="show" class="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-10">
    <div id="print-area" class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col relative">
      <div class="p-8 border-b flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-bold">Specification Sheet</h2>
          <p class="text-gray-500">โครงการติดตั้งสติกเกอร์ตู้ เทศบาลเมืองอุทัยธานี</p>
        </div>
        <img src="/logo.png" class="h-16" alt="Logo" @error="e => e.target.src='https://img1.pic.in.th/images/118819.png'">
      </div>

      <div class="p-8 grid grid-cols-5 gap-8 bg-gray-50 flex-1">
        <div class="col-span-2 bg-white rounded-lg p-6 border flex justify-center items-center">
          <div class="w-full h-full bg-[#b0b5b9] rounded p-4 flex justify-center items-center">
            <img :src="previewSrc" class="max-w-full drop-shadow-lg" alt="Preview">
          </div>
        </div>
        <div class="col-span-3 flex flex-col gap-4 bg-white p-6 rounded-lg border shadow-sm">
          <h3 class="font-bold text-blue-800 border-b-2 border-blue-800 pb-2">📋 รายละเอียด</h3>
          <p><strong>รูปแบบ:</strong> {{ styleName }}</p>
          <p><strong>วัสดุ:</strong> {{ state.currentMaterial }}</p>
          <p class="bg-yellow-50 p-2"><strong>ตู้หมายเลข:</strong> <span class="text-red-600 font-bold">{{ state.customNum }}</span></p>
          <p><strong>ขนาดตรา:</strong> {{ (10 * state.scaleLogo).toFixed(1) }} ซม.</p>
          <p><strong>ขนาดชื่อ:</strong> {{ (2.5 * state.scaleText).toFixed(1) }} ซม.</p>
          <p><strong>ขนาดเลข:</strong> {{ (5.0 * state.scaleNum).toFixed(1) }} ซม.</p>
          <div class="mt-4">
            <h3 class="font-bold text-blue-800 mb-2">🎨 รหัสสี (Hex)</h3>
            <div class="flex gap-4 items-center">
              <div :style="{ backgroundColor: state.COLORS.dark }" class="w-6 h-6 border"></div>
              <span>{{ state.COLORS.dark }}</span> |
              <div :style="{ backgroundColor: state.COLORS.red }" class="w-6 h-6 border"></div>
              <span>{{ state.COLORS.red }}</span> |
              <div :style="{ backgroundColor: state.COLORS.green }" class="w-6 h-6 border"></div>
              <span>{{ state.COLORS.green }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white border-t flex justify-end gap-4 no-print">
        <button @click="$emit('close')" class="px-6 py-3 bg-gray-200 font-bold rounded-lg">กลับไปแก้ไข</button>
        <button @click="() => window.print()" class="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg">🖨️ บันทึก PDF</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { state, styles } from '../modules/state.js'
import { vCanvas } from '../modules/texture.js'

const props = defineProps({ show: Boolean })
defineEmits(['close'])

const previewSrc = computed(() => props.show ? vCanvas.toDataURL() : '')
const styleName = computed(() => styles.find(s => s.id === state.currentStyleId)?.name ?? '')
</script>
