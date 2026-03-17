<template>
  <form @submit.prevent="submit" class="space-y-3">

    <input
      v-model="task.title"
      placeholder="Task title"
      required
      class="w-full p-2 border rounded"
    />

    <textarea
      v-model="task.description"
      placeholder="Description"
      class="w-full p-2 border rounded"
    />

    <input
      v-model.number="task.estimatedHours"
      type="number"
      placeholder="Estimated hours"
      class="w-full p-2 border rounded"
    />

    <button class="bg-blue-500 text-white px-4 py-2 rounded">
      Lag Task
    </button>

  </form>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const task = ref({
  title: '',
  description: '',
  estimatedHours: null
})

const submit = () => {
  emit('submit', task.value)

  task.value = {
    title: '',
    description: '',
    estimatedHours: null
  }
}
</script>