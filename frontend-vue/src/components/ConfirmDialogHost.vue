<template>
  <Modal :model-value="confirmState.open" :title="confirmState.title" @update:modelValue="handleVisibilityChange">
    <div class="space-y-5">
      <div class="flex items-start gap-4">
        <div :class="iconWrapperClass" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-6 w-6"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-7.5 13A1 1 0 0 0 3.66 18h16.68a1 1 0 0 0 .87-1.5l-7.5-13a1 1 0 0 0-1.74 0Z" />
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ confirmState.message }}</p>
          <p v-if="confirmState.details" class="text-sm text-gray-600 dark:text-gray-400">{{ confirmState.details }}</p>
        </div>
      </div>

      <div
        v-if="confirmState.warningText"
        :class="warningPanelClass"
        class="rounded-xl border px-4 py-3"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.18em]">Viktig</p>
        <p class="mt-1 text-sm font-medium">{{ confirmState.warningText }}</p>
      </div>

      <div class="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          @click="confirmDialog.cancel()"
        >
          {{ confirmState.cancelText }}
        </button>
        <button
          type="button"
          :class="confirmButtonClass"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition"
          @click="confirmDialog.confirm()"
        >
          {{ confirmState.confirmText }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from './Modal.vue'
import { confirmDialog } from '../features/shared/confirmDialog.js'

const confirmState = confirmDialog.state

const confirmButtonClass = computed(() => {
  if (confirmState.tone === 'primary') {
    return 'bg-blue-600 hover:bg-blue-700'
  }

  return 'bg-red-600 hover:bg-red-700'
})

const iconWrapperClass = computed(() => {
  if (confirmState.tone === 'primary') {
    return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
  }

  return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
})

const warningPanelClass = computed(() => {
  if (confirmState.tone === 'primary') {
    return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200'
  }

  return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200'
})

function handleVisibilityChange(isVisible) {
  if (!isVisible) {
    confirmDialog.cancel()
  }
}
</script>