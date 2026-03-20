<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tittel</label>
      <input
        v-model="formData.title"
        required
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Beskrivelse</label>
      <textarea
        v-model="formData.description"
        rows="4"
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>
    <div class="grid gap-4 md:grid-cols-3">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Forfallsdato</label>
        <input
          v-model="formData.dueDate"
          type="date"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sortering</label>
        <input
          v-model="formData.orderIndex"
          type="number"
          min="0"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
      <label class="flex items-center gap-2 pt-7 text-sm text-gray-700 dark:text-gray-300">
        <input v-model="formData.completed" type="checkbox" />
        Fullført
      </label>
    </div>
    <div class="flex justify-end">
      <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        {{ milestone ? 'Oppdater milepæl' : 'Legg til milepæl' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  milestone: { type: Object, default: null }
})

const emit = defineEmits(['submit'])

const formData = ref({
  title: '',
  description: '',
  dueDate: '',
  completed: false,
  orderIndex: ''
})

watch(
  () => props.milestone,
  (milestone) => {
    if (milestone) {
      formData.value = {
        title: milestone.title ?? '',
        description: milestone.description ?? '',
        dueDate: milestone.dueDate ? String(milestone.dueDate).slice(0, 10) : '',
        completed: Boolean(milestone.completed),
        orderIndex: milestone.orderIndex ?? ''
      }
      return
    }

    formData.value = {
      title: '',
      description: '',
      dueDate: '',
      completed: false,
      orderIndex: ''
    }
  },
  { immediate: true }
)

function submit() {
  emit('submit', {
    ...formData.value,
    dueDate: formData.value.dueDate || null,
    orderIndex: formData.value.orderIndex === '' ? null : Number(formData.value.orderIndex)
  })
}
</script>