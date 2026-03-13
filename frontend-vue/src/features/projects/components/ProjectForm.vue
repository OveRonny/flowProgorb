<template>
  <form @submit.prevent="submitForm" class="flex flex-col gap-4">
    <input
      v-model="name"
      type="text"
      placeholder="Prosjektnavn"
      class="border rounded px-4 py-2 dark:bg-gray-700 dark:text-gray-100"
      required
    />
    <textarea
      v-model="description"
      placeholder="Beskrivelse"
      class="border rounded px-4 py-2 dark:bg-gray-700 dark:text-gray-100"
      required
    ></textarea>
    <input
    v-model="deadline"
    type="date"
    class="border rounded px-4 py-2 dark:bg-gray-700 dark:text-gray-100"
  />
    <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      Legg til prosjekt
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(["submit"])

const name = ref('')
const description = ref('')
const deadline = ref('')

function submitForm() {
   const deadlineDate = deadline.value ? new Date(deadline.value) : null
  emit('submit', { name: name.value, description: description.value, deadline: deadlineDate })
  name.value = ''
  description.value = ''
}
</script>