<template>
  <input
    type="text"
    :placeholder="placeholder"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
  />
</template>

<script setup>
defineProps({
  modelValue: String,
  placeholder: { type: String, default: "Søk..." }
})

const emit = defineEmits(["update:modelValue"])
</script>