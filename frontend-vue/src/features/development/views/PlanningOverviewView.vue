<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Planlegging</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">Administrer kundemøter, milepæler og krav på tvers av alle prosjekter</p>
        <router-link
          to="/planning/start"
          class="mt-3 inline-block rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
        >
          Start planlegging før prosjekt
        </router-link>
        <label class="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input v-model="showArchived" type="checkbox" />
          Vis arkiverte (På vent)
        </label>
      </div>

      <p v-if="loading" class="text-gray-600 dark:text-gray-400">Laster planleggingsdata...</p>
      <p v-else-if="visibleProjects.length === 0" class="rounded border border-gray-200 bg-white px-4 py-6 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Ingen prosjekter funnet.
      </p>

      <div v-else class="grid gap-6 lg:grid-cols-3">
        <div
          v-for="project in visibleProjects"
          :key="project.id"
          class="rounded border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <router-link
            :to="{ name: 'ProjectPlanning', params: { id: project.id } }"
            class="mb-4 block font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
          >
            {{ project.name }}
          </router-link>

          <div class="space-y-4">
            <div>
              <h4 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Krav</h4>
              <div class="space-y-1">
                <div v-if="(project.requirements || []).length === 0" class="text-xs text-gray-500 dark:text-gray-400">
                  Ingen
                </div>
                <div
                  v-for="req in (project.requirements || []).slice(0, 3)"
                  :key="req.id"
                  class="truncate text-xs text-gray-600 dark:text-gray-400"
                >
                  • {{ req.title }}
                </div>
                <div v-if="(project.requirements || []).length > 3" class="text-xs text-gray-500 dark:text-gray-400">
                  +{{ (project.requirements || []).length - 3 }} flere
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Milepæler</h4>
              <div class="space-y-1">
                <div v-if="(project.milestones || []).length === 0" class="text-xs text-gray-500 dark:text-gray-400">
                  Ingen
                </div>
                <div
                  v-for="milestone in (project.milestones || []).slice(0, 3)"
                  :key="milestone.id"
                  class="flex items-center justify-between text-xs"
                >
                  <span class="truncate text-gray-600 dark:text-gray-400">• {{ milestone.title }}</span>
                  <span :class="milestone.completed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'">
                    {{ milestone.completed ? '✓' : '◯' }}
                  </span>
                </div>
                <div v-if="(project.milestones || []).length > 3" class="text-xs text-gray-500 dark:text-gray-400">
                  +{{ (project.milestones || []).length - 3 }} flere
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Møter</h4>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ (project.customerMeetings || []).length }} møte{{ (project.customerMeetings || []).length !== 1 ? 'r' : '' }}
              </div>
            </div>

            <router-link
              :to="{ name: 'ProjectPlanning', params: { id: project.id } }"
              class="block rounded bg-amber-600 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              Vis detaljer
            </router-link>

            <button
              v-if="project.status !== 'ON_HOLD'"
              class="block w-full rounded bg-gray-700 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-gray-800"
              @click="archiveProject(project.id)"
            >
              Arkiver prosjekt
            </button>
            <button
              v-else
              class="block w-full rounded bg-emerald-600 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-emerald-700"
              @click="restoreProject(project.id)"
            >
              Gjenopprett prosjekt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '../../projects/store.js'

const projectStore = useProjectsStore()
const loading = ref(false)
const showArchived = ref(false)

const projects = computed(() => projectStore.projects || [])
const visibleProjects = computed(() =>
  projects.value.filter((project) => showArchived.value || project.status !== 'ON_HOLD')
)

async function loadProjects() {
  loading.value = true
  try {
    await projectStore.fetchProjects()
    
    // Load planning data for all projects
    for (const project of projects.value) {
      await projectStore.fetchProjectPlanning(project.id)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProjects()
})

async function archiveProject(projectId) {
  const updated = await projectStore.updateProject(projectId, { status: 'ON_HOLD' })
  if (!updated) {
    return
  }

  await loadProjects()
}

async function restoreProject(projectId) {
  const updated = await projectStore.updateProject(projectId, { status: 'PLANNED' })
  if (!updated) {
    return
  }

  await loadProjects()
}
</script>
