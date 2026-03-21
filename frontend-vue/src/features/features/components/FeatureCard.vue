<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ feature.name }}
        </h3>
        <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {{ feature.description || 'Ingen beskrivelse' }}
        </p>
      </div>
      <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusClass">
        {{ statusLabel }}
      </span>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-2">
      <div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
        <p class="text-xs text-gray-500 dark:text-gray-400">Oppgaver</p>
        <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ taskCount }}</p>
      </div>
      <div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
        <p class="text-xs text-gray-500 dark:text-gray-400">Tid</p>
        <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ totalTaskHours }}t</p>
      </div>
      <div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
        <p class="text-xs text-gray-500 dark:text-gray-400">Ferdig</p>
        <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ doneTaskCount }}/{{ taskCount }}</p>
      </div>
    </div>

    <div class="mt-4 rounded-lg border border-gray-200 px-3 py-3 dark:border-gray-700">
      <div class="flex items-center justify-between text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">Fremdrift</span>
        <span class="font-semibold text-gray-900 dark:text-gray-100">{{ taskProgressPercent }}%</span>
      </div>
      <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div class="h-full rounded-full bg-green-500 transition-all" :style="{ width: taskProgressPercent + '%' }"></div>
      </div>
    </div>

    <div class="mt-4">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Teknologier</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tech in feature.technologies || []"
          :key="tech.id"
          class="rounded-full px-2.5 py-1 text-xs font-medium"
          :class="techTypeClass(tech.type)"
        >
          {{ tech.name }}
        </span>
        <span
          v-if="!(feature.technologies || []).length"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          Ingen teknologier
        </span>
      </div>
    </div>

    <div class="mt-4 rounded-lg border border-gray-200 px-3 py-3 text-sm dark:border-gray-700">
      <div class="flex items-center justify-between">
        <span class="font-medium text-gray-700 dark:text-gray-300">GitHub Issue</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ feature.githubIssueState || 'ikke-koblet' }}</span>
      </div>
      <a
        v-if="feature.githubIssueUrl"
        :href="feature.githubIssueUrl"
        target="_blank"
        rel="noreferrer"
        class="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        Åpne koblet issue
      </a>
      <p v-else class="mt-2 text-xs text-gray-500 dark:text-gray-400">Ingen issue er koblet ennå.</p>
    </div>

    <div class="mt-5 flex flex-wrap gap-2">
      <button
        @click="$emit('viewTasks')"
        class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Vis oppgaver
      </button>
      <button
        @click="$emit('edit', feature)"
        class="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
      >
        Rediger
      </button>
      <button
        @click="$emit('delete', feature)"
        class="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
      >
        Slett
      </button>
      <button
        @click="$emit('createIssue', feature)"
        :disabled="!githubConnected"
        class="rounded-md px-3 py-2 text-sm font-medium transition"
        :class="githubConnected
          ? 'bg-gray-900 text-white hover:bg-black'
          : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
        :title="githubConnected ? 'Opprett GitHub-issue' : 'Koble til et GitHub-repo først'"
      >
        Opprett issue
      </button>
      <button
        @click="$emit('syncIssue', feature)"
        :disabled="!githubConnected"
        class="rounded-md px-3 py-2 text-sm font-medium transition"
        :class="githubConnected
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
          : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
        :title="githubConnected ? 'Synkroniser koblet GitHub-issue' : 'Koble til et GitHub-repo først'"
      >
        Synkroniser issue
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calculateTaskCollectionProgress } from '../../shared/progress.js'

const props = defineProps({
  feature: Object,
  githubConnected: {
    type: Boolean,
    default: false
  }
})

const taskCount = computed(() => (props.feature?.tasks || []).length)

const doneTaskCount = computed(() =>
  (props.feature?.tasks || []).filter(task => task.status === 'DONE').length
)

const taskProgressPercent = computed(() => {
  return calculateTaskCollectionProgress(props.feature?.tasks || [])
})

const totalTaskHours = computed(() => {
  const minutes = (props.feature?.tasks || []).reduce((taskSum, task) => {
    const taskMinutes = (task.timeLogs || []).reduce((logSum, log) => logSum + (Number(log.minutes) || 0), 0)
    return taskSum + taskMinutes
  }, 0)

  return (minutes / 60).toFixed(2)
})

const statusLabel = computed(() => {
  switch (props.feature?.status) {
    case 'IN_PROGRESS':
      return 'Under arbeid'
    case 'DONE':
      return 'Ferdig'
    default:
      return 'Planlagt'
  }
})

const statusClass = computed(() => {
  switch (props.feature?.status) {
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    case 'DONE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
})

const techTypeClass = (type) => {
  switch (type) {
    case 'LANGUAGE': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    case 'FRAMEWORK': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
    case 'LIBRARY': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

defineEmits(['edit', 'delete', 'viewTasks', 'createIssue', 'syncIssue'])
</script>
