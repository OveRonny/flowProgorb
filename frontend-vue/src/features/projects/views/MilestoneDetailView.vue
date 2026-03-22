<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <router-link :to="{ name: 'ProjectPlanning', params: { id: projectId } }" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Tilbake til planlegging
          </router-link>
          <h1 v-if="milestone" class="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ milestone.title }}</h1>
        </div>
        <div v-if="milestone" class="flex gap-2">
          <button @click="startEdit" class="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
            Rediger
          </button>
          <button @click="handleDelete" class="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
            Slett
          </button>
        </div>
      </div>

      <p v-if="loading" class="text-gray-600 dark:text-gray-400">Laster milepæl...</p>

      <div v-if="milestone" class="space-y-6">
        <div class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
              <span :class="[
                'mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium',
                milestone.completed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              ]">
                {{ milestone.completed ? 'Fullført' : 'Åpen' }}
              </span>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Frist</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(milestone.dueDate) }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Opprettet</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(milestone.createdAt) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Beskrivelse</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">{{ milestone.description || 'Ingen beskrivelse oppgitt' }}</p>
        </div>
      </div>

      <Modal v-model="showEditModal" title="Rediger milepæl">
        <MilestoneForm v-if="milestone" :milestone="milestone" @submit="handleUpdate" />
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '../store.js'
import Modal from '../../../components/Modal.vue'
import { confirmDialog } from '../../shared/confirmDialog.js'
import MilestoneForm from '../components/MilestoneForm.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectsStore()

const milestone = ref(null)
const loading = ref(false)
const showEditModal = ref(false)

const projectId = computed(() => Number(route.params.projectId))
const milestoneId = computed(() => Number(route.params.id))

async function loadMilestone() {
  loading.value = true
  try {
    const planning = await projectStore.fetchProjectPlanning(projectId.value)
    if (planning) {
      milestone.value = planning.milestones?.find((m) => m.id === milestoneId.value)
    }
  } finally {
    loading.value = false
  }
}

watch([projectId, milestoneId], () => {
  loadMilestone()
}, { immediate: true })

function startEdit() {
  showEditModal.value = true
}

async function handleUpdate(payload) {
  const updated = await projectStore.updateMilestone(projectId.value, milestoneId.value, payload)
  if (!updated) {
    return
  }
  await loadMilestone()
  showEditModal.value = false
}

async function handleDelete() {
  const confirmed = await confirmDialog.open({
    title: 'Slett milepæl',
    message: `Slette milepælen ${milestone.value?.title || ''}?`,
    details: 'Milepælen blir fjernet fra prosjektplanen.',
    confirmText: 'Slett',
    tone: 'danger'
  })
  if (!confirmed) {
    return
  }
  await projectStore.deleteMilestone(projectId.value, milestoneId.value)
  router.push({ name: 'ProjectPlanning', params: { id: projectId.value } })
}

function formatDate(date) {
  if (!date) return 'Ikke satt'
  return new Date(date).toLocaleDateString('no-NO')
}
</script>
