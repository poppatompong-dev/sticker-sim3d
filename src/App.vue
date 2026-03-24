<script setup>
import { ref } from 'vue'
import ControlPanel from './components/ControlPanel.vue'
import ComparisonView from './components/ComparisonView.vue'
import ExportModal from './components/ExportModal.vue'

const showExport = ref(false)
</script>

<template>
  <div id="main-ui" class="flex flex-col h-screen">
    <div class="flex-1 overflow-hidden flex flex-col md:flex-row bg-white z-20">
      <ControlPanel @open-export="showExport = true" />
      <ComparisonView />
    </div>
    <ExportModal :show="showExport" @close="showExport = false" />
  </div>
</template>
