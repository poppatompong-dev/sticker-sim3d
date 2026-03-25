<script setup>
import { ref } from 'vue'
import ControlPanel from './components/ControlPanel.vue'
import ComparisonView from './components/ComparisonView.vue'
import ExportModal from './components/ExportModal.vue'

const showExport = ref(false)
const panelOpen = ref(true)
</script>

<template>
  <div id="main-ui" class="flex flex-col h-screen">
    <div class="flex-1 min-h-0 flex flex-col md:flex-row bg-white z-20 relative">
      <!-- Collapsible left panel wrapper -->
      <div
        class="flex-shrink-0 h-full overflow-hidden transition-[width,max-width] duration-300 ease-in-out"
        :class="panelOpen ? 'w-[320px] lg:w-[400px] max-w-[400px]' : 'w-0 max-w-0'"
      >
        <ControlPanel @open-export="showExport = true" />
      </div>

      <!-- Toggle tab (hidden on mobile when panel is open to save space) -->
      <button
        @click="panelOpen = !panelOpen"
        class="absolute top-1/2 -translate-y-1/2 z-30 bg-white border border-gray-300 shadow-md rounded-r-lg px-1 py-3 flex flex-col items-center transition-[left] duration-300 hover:bg-gray-50"
        :class="panelOpen ? 'left-[320px] lg:left-[400px]' : 'left-0'"
        :title="panelOpen ? 'ซ่อนเมนู' : 'แสดงเมนู'"
      >
        <span class="text-gray-500 text-xs font-bold leading-none">{{ panelOpen ? '◀' : '▶' }}</span>
      </button>

      <ComparisonView />
    </div>
    <ExportModal :show="showExport" @close="showExport = false" />
  </div>
</template>
