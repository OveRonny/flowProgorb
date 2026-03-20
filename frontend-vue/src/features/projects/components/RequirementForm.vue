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
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prioritet</label>
        <input
          v-model="formData.priority"
          type="number"
          min="1"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
        <select
          v-model="formData.status"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="OPEN">OPEN</option>
          <option value="APPROVED">APPROVED</option>
          <option value="IMPLEMENTED">IMPLEMENTED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kundemøte</label>
        <select
          v-model="formData.meetingId"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">Ingen</option>
          <option v-for="meeting in meetings" :key="meeting.id" :value="String(meeting.id)">
            {{ meeting.title }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex justify-end">
      <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        {{ requirement ? 'Oppdater requirement' : 'Legg til requirement' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  requirement: { type: Object, default: null },
  meetings: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit'])

const formData = ref({
  title: '',
  description: '',
  priority: '',
  status: 'OPEN',
  meetingId: ''
})

watch(
  () => props.requirement,
  (requirement) => {
    if (requirement) {
      formData.value = {
        title: requirement.title ?? '',
        description: requirement.description ?? '',
        priority: requirement.priority ?? '',
        status: requirement.status ?? 'OPEN',
        meetingId: requirement.meetingId != null ? String(requirement.meetingId) : ''
      }
      return
    }

    formData.value = {
      title: '',
      description: '',
      priority: '',
      status: 'OPEN',
      meetingId: ''
    }
  },
  { immediate: true }
)

function submit() {
  emit('submit', {
    ...formData.value,
    priority: formData.value.priority === '' ? null : Number(formData.value.priority),
    meetingId: formData.value.meetingId === '' ? null : Number(formData.value.meetingId)
  })
}
</script>