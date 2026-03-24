<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <h2 class="text-md font-bold text-gray-800 mb-3">เลือกรูปแบบตั้งต้น (20 ดีไซน์)</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      <button
        v-for="s in styles"
        :key="s.id"
        class="style-btn bg-white border-2 p-3 rounded-xl text-left min-h-[80px]"
        :class="{ active: state.currentStyleId === s.id }"
        @click="selectStyle(s)"
      >
        <div class="font-bold text-sm">{{ s.name }}</div>
        <div class="text-xs text-gray-500">{{ s.desc }}</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { state, styles } from '../modules/state.js'
import { renderTexture } from '../modules/texture.js'
import { getRenderer } from '../modules/scene.js'

const emit = defineEmits(['style-changed'])

function selectStyle(s) {
  renderTexture(s.id, getRenderer())
  emit('style-changed', s.name)
}
</script>
