<template>
  <form @submit.prevent="submit" class="space-y-3">

    <input
      v-model="task.title"
      placeholder="Oppgavetittel"
      required
      class="w-full p-2 border rounded"
    />

    <textarea
      v-model="task.description"
      placeholder="Beskrivelse"
      class="w-full p-2 border rounded"
    />

    <input
      v-model="task.estimatedHours"
      type="text"
      inputmode="decimal"
      placeholder="Estimerte timer, f.eks. 0,5"
      class="w-full p-2 border rounded"
    />
    <p class="text-xs text-gray-500">Du kan bruke desimaltimer, for eksempel 0,5 for 30 minutter.</p>

    <button class="bg-blue-500 text-white px-4 py-2 rounded">
      Lag oppgave
    </button>

  </form>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const task = ref({
  title: '',
  description: '',
  estimatedHours: ''
})

const normalizeEstimatedHours = (value) => {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) {
    return null
  }

  const normalized = trimmed.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const submit = () => {
  emit('submit', {
    ...task.value,
    estimatedHours: normalizeEstimatedHours(task.value.estimatedHours)
  })

  task.value = {
    title: '',
    description: '',
    estimatedHours: ''
  }
}
</script>