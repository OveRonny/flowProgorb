<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <router-link :to="{ name: 'ProjectPlanning', params: { id: projectId } }" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Back to Planning
          </router-link>
          <h1 v-if="requirement" class="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ requirement.title }}</h1>
        </div>
        <div v-if="requirement" class="flex gap-2">
          <button @click="startEdit" class="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
            Edit
          </button>
          <button @click="handleDelete" class="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>

      <p v-if="loading" class="text-gray-600 dark:text-gray-400">Loading requirement...</p>

      <div v-if="requirement" class="space-y-6">
        <div class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
              <span class="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {{ requirement.status }}
              </span>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Priority</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ requirement.priority ?? 'Not set' }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Created</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(requirement.createdAt) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Description</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">{{ requirement.description || 'No description provided' }}</p>
        </div>

        <div v-if="requirement.meeting" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Related Meeting</h3>
          <router-link :to="{ name: 'MeetingDetail', params: { projectId, id: requirement.meeting.id } }" class="mt-2 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400">
            {{ requirement.meeting.title }}
          </router-link>
        </div>

        <div v-if="requirement.features && requirement.features.length > 0" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Linked Features</h3>
          <ul class="mt-3 space-y-2">
            <li v-for="feature in requirement.features" :key="feature.id">
              <div class="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-700">
                <span class="text-sm text-gray-900 dark:text-gray-100">{{ feature.name }}</span>
                <span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-300">{{ feature.status }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <Modal v-model="showEditModal" title="Edit Requirement">
        <RequirementForm v-if="requirement" :requirement="requirement" :meetings="meetings" @submit="handleUpdate" />
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '../store.js'
import Modal from '../../../components/Modal.vue'
import RequirementForm from '../components/RequirementForm.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectsStore()

const requirement = ref(null)
const meetings = ref([])
const loading = ref(false)
const showEditModal = ref(false)

const projectId = computed(() => Number(route.params.projectId))
const requirementId = computed(() => Number(route.params.id))

async function loadRequirement() {
  loading.value = true
  try {
    const planning = await projectStore.fetchProjectPlanning(projectId.value)
    if (planning) {
      requirement.value = planning.requirements?.find((r) => r.id === requirementId.value)
      meetings.value = planning.customerMeetings || []
    }
  } finally {
    loading.value = false
  }
}

watch([projectId, requirementId], () => {
  loadRequirement()
}, { immediate: true })

function startEdit() {
  showEditModal.value = true
}

async function handleUpdate(payload) {
  const updated = await projectStore.updateRequirement(projectId.value, requirementId.value, payload)
  if (!updated) {
    return
  }
  await loadRequirement()
  showEditModal.value = false
}

async function handleDelete() {
  if (!confirm('Delete this requirement?')) {
    return
  }
  await projectStore.deleteRequirement(projectId.value, requirementId.value)
  router.push({ name: 'ProjectPlanning', params: { id: projectId.value } })
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('no-NO')
}
</script>
