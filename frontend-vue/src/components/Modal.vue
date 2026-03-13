<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative"> 
          
      <button @click="$emit('update:modelValue', false)" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
        ✕
      </button>
     
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{{ title }}</h2>
      <slot></slot>
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