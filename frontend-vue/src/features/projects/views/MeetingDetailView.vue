<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <router-link :to="{ name: 'ProjectPlanning', params: { id: projectId } }" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Tilbake til planlegging
          </router-link>
          <h1 v-if="meeting" class="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ meeting.title }}</h1>
        </div>
        <div v-if="meeting" class="flex gap-2">
          <button @click="startEdit" class="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
            Rediger
          </button>
          <button @click="handleDelete" class="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
            Slett
          </button>
        </div>
      </div>

      <p v-if="loading" class="text-gray-600 dark:text-gray-400">Laster møte...</p>

      <div v-if="meeting" class="space-y-6">
        <div class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="grid gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Dato</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDateTime(meeting.date) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Notater</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">{{ meeting.notes || 'Ingen notater oppgitt' }}</p>
        </div>

        <div v-if="meeting.attendees && meeting.attendees.length > 0" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Deltakere</h3>
          <ul class="mt-3 space-y-2">
            <li v-for="attendee in meeting.attendees" :key="attendee.id" class="rounded bg-gray-50 p-2 dark:bg-gray-700">
              <p class="text-sm text-gray-900 dark:text-gray-100">{{ attendee.githubLogin || attendee.email }}</p>
            </li>
          </ul>
        </div>

        <div v-if="meeting.requirements && meeting.requirements.length > 0" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Relaterte krav</h3>
          <ul class="mt-3 space-y-2">
            <li v-for="requirement in meeting.requirements" :key="requirement.id">
              <router-link
                :to="{ name: 'RequirementDetail', params: { projectId, id: requirement.id } }"
                class="flex items-center justify-between rounded bg-gray-50 p-2 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/20"
              >
                <span class="text-sm text-gray-900 dark:text-gray-100">{{ requirement.title }}</span>
                <span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-300">{{ requirementStatusLabel(requirement.status) }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <Modal v-model="showEditModal" title="Rediger møte">
        <CustomerMeetingForm v-if="meeting" :meeting="meeting" :members="members" @submit="handleUpdate" />
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
import CustomerMeetingForm from '../components/CustomerMeetingForm.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectsStore()

const meeting = ref(null)
const members = ref([])
const loading = ref(false)
const showEditModal = ref(false)

const projectId = computed(() => Number(route.params.projectId))
const meetingId = computed(() => Number(route.params.id))

async function loadMeeting() {
  loading.value = true
  try {
    const planning = await projectStore.fetchProjectPlanning(projectId.value)
    if (planning) {
      meeting.value = planning.customerMeetings?.find((m) => m.id === meetingId.value)
      members.value = planning.members || []
    }
  } finally {
    loading.value = false
  }
}

watch([projectId, meetingId], () => {
  loadMeeting()
}, { immediate: true })

function startEdit() {
  showEditModal.value = true
}

function requirementStatusLabel(status) {
  const labels = {
    OPEN: 'Åpen',
    APPROVED: 'Godkjent',
    IMPLEMENTED: 'Implementert',
    REJECTED: 'Avvist'
  }

  return labels[status] || status
}

async function handleUpdate(payload) {
  const updated = await projectStore.updateCustomerMeeting(projectId.value, meetingId.value, payload)
  if (!updated) {
    return
  }
  await loadMeeting()
  showEditModal.value = false
}

async function handleDelete() {
  const confirmed = await confirmDialog.open({
    title: 'Slett kundemøte',
    message: `Slette møtet ${meeting.value?.title || ''}?`,
    details: 'Møtet blir fjernet fra planleggingen.',
    confirmText: 'Slett',
    tone: 'danger'
  })
  if (!confirmed) {
    return
  }
  await projectStore.deleteCustomerMeeting(projectId.value, meetingId.value)
  router.push({ name: 'ProjectPlanning', params: { id: projectId.value } })
}

function formatDateTime(date) {
  if (!date) return 'Ikke satt'
  return new Date(date).toLocaleString('no-NO')
}
</script>
