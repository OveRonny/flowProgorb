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
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notater</label>
      <textarea
        v-model="formData.notes"
        rows="4"
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Dato</label>
      <input
        v-model="formData.date"
        type="datetime-local"
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>
    <div>
      <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Deltakere</p>
      <div class="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <label v-for="member in members" :key="member.user.id" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input :checked="formData.attendeeIds.includes(member.user.id)" type="checkbox" @change="toggleAttendee(member.user.id)" />
          <span>{{ member.user.githubLogin || member.user.email }}</span>
        </label>
        <p v-if="!members.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen prosjektmedlemmer funnet.</p>
      </div>
    </div>
    <div class="flex justify-end">
      <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        {{ meeting ? 'Oppdater møte' : 'Legg til møte' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  meeting: { type: Object, default: null },
  members: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit'])

const formData = ref({
  title: '',
  notes: '',
  date: '',
  attendeeIds: []
})

watch(
  () => props.meeting,
  (meeting) => {
    if (meeting) {
      formData.value = {
        title: meeting.title ?? '',
        notes: meeting.notes ?? '',
        date: meeting.date ? new Date(meeting.date).toISOString().slice(0, 16) : '',
        attendeeIds: (meeting.attendees || []).map((attendee) => Number(attendee.id))
      }
      return
    }

    formData.value = {
      title: '',
      notes: '',
      date: '',
      attendeeIds: []
    }
  },
  { immediate: true }
)

function toggleAttendee(id) {
  const attendeeId = Number(id)
  if (formData.value.attendeeIds.includes(attendeeId)) {
    formData.value.attendeeIds = formData.value.attendeeIds.filter((entry) => entry !== attendeeId)
  } else {
    formData.value.attendeeIds.push(attendeeId)
  }
}

function submit() {
  emit('submit', {
    ...formData.value,
    date: formData.value.date || null,
    attendeeIds: formData.value.attendeeIds.map(Number)
  })
}
</script>