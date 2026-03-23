<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Utvikling</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">Administrer funksjoner, moduler og oppgaver på tvers av alle prosjekter</p>
      </div>

      <router-link to="/project" class="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Vis alle prosjekter
      </router-link>

      <p v-if="authStore.loading" class="text-gray-600 dark:text-gray-400">Laster prosjekter...</p>
      <p v-else-if="projects.length === 0" class="rounded border border-gray-200 bg-white px-4 py-6 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Ingen aktive prosjekter funnet. Opprett eller gjenopprett et prosjekt i planlegging.
      </p>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="project in projects"
          :key="project.id"
          :to="{ name: 'Features', params: { id: project.id } }"
          class="rounded border border-gray-200 bg-white p-5 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ project.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ project.description || 'Ingen beskrivelse' }}</p>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Fremdrift</span>
                <span>{{ Math.round(project.progress) }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div class="h-2 rounded-full bg-blue-500 transition-all" :style="{ width: Math.round(project.progress) + '%' }"></div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {{ (project.features || []).length }} funksjoner
              </span>
              <span class="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {{ projectStatusLabel(project.status) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectsStore } from '../../projects/store.js'

const authStore = useProjectsStore()

const projects = computed(() =>
  (authStore.projects || []).filter((project) => !['PLANNED', 'ON_HOLD'].includes(project.status))
)

function projectStatusLabel(status) {
  const labels = {
    PLANNED: 'Planlagt',
    ACTIVE: 'Aktiv',
    COMPLETED: 'Fullført',
    ON_HOLD: 'På vent'
  }

  return labels[status] || status
}

authStore.fetchProjects()
</script>
