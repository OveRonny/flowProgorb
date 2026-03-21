<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded shadow mb-3">
    
    <!-- Title -->
    <h3 class="font-semibold text-gray-800 dark:text-gray-200">
      {{ task.title }}
    </h3>

    <!-- Description -->
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {{ task.description }}
    </p>

    <!-- Task info -->
    <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">

      <div v-if="task.estimatedHours">
        ⏱ Estimert: <span class="font-medium">{{ task.estimatedHours }}h</span>
      </div>

      <div v-if="task.completedAt">
        ✅ Ferdig:
        <span class="font-medium">
          {{ new Date(task.completedAt).toLocaleDateString('no-NO') }}
        </span>
      </div>

      <div v-if="totalLoggedMinutes > 0">
        🕒 Logget tid:
        <span class="font-medium">{{ totalLoggedHours }} timer</span>
      </div>

      <div v-if="task.estimatedHours">
        📊 {{ varianceLabel }}:
        <span class="font-medium">{{ varianceHours }} timer</span>
      </div>

    </div>

    <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
      <p class="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300 mb-2">Tidslogger</p>

      <div class="space-y-2 mb-3" v-if="(task.timeLogs ?? []).length">
        <div v-for="log in task.timeLogs" :key="log.id"
          class="flex items-start justify-between gap-2 text-xs bg-gray-100 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 p-2.5 rounded-md">
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-100">{{ minutesToHoursLabel(log.minutes) }} timer</p>
            <p class="text-gray-500 dark:text-gray-300">{{ log.note || 'Ingen notat' }}</p>
          </div>
          <div v-if="canEditTimeLogs" class="flex gap-2">
            <button class="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              @click="editTimeLog(log)">Rediger</button>
            <button class="px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
              @click="$emit('deleteTimeLog', task, log.id)">Slett</button>
          </div>
        </div>
      </div>

      <p v-else class="text-xs text-gray-500 dark:text-gray-400 mb-3">Ingen tidslogger enda.</p>

      <div v-if="canEditTimeLogs" class="flex gap-2">
        <input v-model="newMinutes" type="number" min="1" placeholder="Min"
          class="w-20 text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        <input v-model="newNote" type="text" placeholder="Notat (valgfritt)"
          class="flex-1 text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        <button class="text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white px-3 py-1.5 rounded-md transition" @click="addTimeLog">
          + Logg
        </button>
      </div>
      <p v-if="canEditTimeLogs && newHoursLabel" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Tilsvarer {{ newHoursLabel }} timer
      </p>
      <p v-else-if="!canEditTimeLogs" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Tidslogging er kun aktiv for oppgaver med status Under arbeid.
      </p>
    </div>

    <!-- Status buttons -->
    <div class="flex gap-2 mt-3">

      <button
        v-if="task.status !== 'PENDING'"
        @click="$emit('updateStatus', task, 'PENDING')"
        class="text-xs bg-gray-300 px-2 py-1 rounded"
      >
        Å gjøre
      </button>

      <button
        v-if="task.status !== 'IN_PROGRESS'"
        @click="$emit('updateStatus', task, 'IN_PROGRESS')"
        class="text-xs bg-yellow-400 px-2 py-1 rounded"
      >
        Start
      </button>

      <button
        v-if="task.status !== 'DONE'"
        @click="$emit('updateStatus', task, 'DONE')"
        class="text-xs bg-green-500 text-white px-2 py-1 rounded"
      >
        Ferdig
      </button>

      <button
        @click="$emit('deleteTask', task)"
        class="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
      >
        Slett
      </button>

    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  task: Object
})

const totalLoggedMinutes = computed(() =>
  (props.task?.timeLogs ?? []).reduce((sum, log) => sum + (Number(log.minutes) || 0), 0)
)

const totalLoggedHours = computed(() => minutesToHoursLabel(totalLoggedMinutes.value))

const estimatedMinutes = computed(() => (Number(props.task?.estimatedHours) || 0) * 60)
const varianceMinutes = computed(() => totalLoggedMinutes.value - estimatedMinutes.value)
const varianceHours = computed(() => minutesToHoursLabel(Math.abs(varianceMinutes.value)))
const varianceLabel = computed(() => (varianceMinutes.value > 0 ? 'Over estimat' : 'Gjenstår'))
const canEditTimeLogs = computed(() => props.task?.status === 'IN_PROGRESS')

const minutesToHoursLabel = (minutes) => {
  const value = Number(minutes)
  if (!Number.isFinite(value) || value <= 0) return '0.00'
  return (value / 60).toFixed(2)
}

const newHoursLabel = computed(() => {
  const minutes = Number(newMinutes.value)
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  return (minutes / 60).toFixed(2)
})

const newMinutes = ref('')
const newNote = ref('')

const emit = defineEmits(['updateStatus', 'addTimeLog', 'updateTimeLog', 'deleteTimeLog', 'deleteTask'])

const addTimeLog = () => {
  const minutes = Number(newMinutes.value)
  if (!Number.isInteger(minutes) || minutes <= 0) return

  emit('addTimeLog', props.task, {
    minutes,
    note: newNote.value?.trim() || null
  })

  newMinutes.value = ''
  newNote.value = ''
}

const editTimeLog = (log) => {
  const minutesInput = window.prompt('Antall minutter', String(log.minutes ?? ''))
  if (minutesInput === null) return

  const minutes = Number(minutesInput)
  if (!Number.isInteger(minutes) || minutes <= 0) return

  const noteInput = window.prompt('Notat (valgfritt)', log.note ?? '')
  if (noteInput === null) return

  emit('updateTimeLog', props.task, log.id, {
    minutes,
    note: noteInput.trim() || null
  })
}
</script>