<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[1px]"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h2>
        <button
          @click="$emit('update:modelValue', false)"
          class="rounded-md px-2 py-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          ?
        </button>
      </div>

      <div class="max-h-[80vh] overflow-y-auto px-6 py-5">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Modal' }
})
defineEmits(['update:modelValue'])
</script>
