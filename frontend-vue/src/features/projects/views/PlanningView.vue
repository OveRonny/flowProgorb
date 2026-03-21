<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl space-y-6">
      <div v-if="project" class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ project.name }} planlegging</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Kundemøter, milepæler og krav</p>
        </div>
        <router-link :to="{ name: 'Features', params: { id: project.id } }" class="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
          Tilbake til funksjoner
        </router-link>
      </div>

      <p v-if="projectStore.error" class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        {{ projectStore.error }}
      </p>

      <div class="grid gap-6 xl:grid-cols-3">
        <section class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Krav</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Krav og avklaringer</p>
            </div>
            <button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openRequirementModal()">Ny</button>
          </div>
          <div class="space-y-3">
            <article v-for="requirement in requirements" :key="requirement.id" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <router-link :to="{ name: 'RequirementDetail', params: { projectId: project.id, id: requirement.id } }" class="flex items-start justify-between gap-3 hover:opacity-80">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ requirement.title }}</h4>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ requirement.description || 'Ingen beskrivelse' }}</p>
                </div>
                <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">{{ requirementStatusLabel(requirement.status) }}</span>
              </router-link>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Prioritet: {{ requirement.priority ?? 'Ikke satt' }}
                <span v-if="requirement.meeting"> | Møte: {{ requirement.meeting.title }}</span>
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Funksjoner: {{ (requirement.features || []).map((feature) => feature.name).join(', ') || 'Ingen' }}
              </p>
              <div class="mt-3 flex gap-2">
                <button class="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600" @click="openRequirementModal(requirement)">Rediger</button>
                <button class="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600" @click="handleDeleteRequirement(requirement)">Slett</button>
              </div>
            </article>
            <p v-if="!requirements.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen krav enda.</p>
          </div>
        </section>

        <section class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Milepæler</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Mål og leveransepunkter</p>
            </div>
            <button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openMilestoneModal()">Ny</button>
          </div>
          <div class="space-y-3">
            <article v-for="milestone in milestones" :key="milestone.id" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <router-link :to="{ name: 'MilestoneDetail', params: { projectId: project.id, id: milestone.id } }" class="flex items-start justify-between gap-3 hover:opacity-80">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ milestone.title }}</h4>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ milestone.description || 'Ingen beskrivelse' }}</p>
                </div>
                <span class="rounded-full px-2 py-1 text-xs font-medium" :class="milestone.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'">
                  {{ milestone.completed ? 'Ferdig' : 'Åpen' }}
                </span>
              </router-link>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Forfall: {{ formatDate(milestone.dueDate) }}</p>
              <div class="mt-3 flex gap-2">
                <button class="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600" @click="openMilestoneModal(milestone)">Rediger</button>
                <button class="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600" @click="handleDeleteMilestone(milestone)">Slett</button>
              </div>
            </article>
            <p v-if="!milestones.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen milepæler enda.</p>
          </div>
        </section>

        <section class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Kundemøter</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Møter, deltakere og oppfølging</p>
            </div>
            <button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openMeetingModal()">Nytt</button>
          </div>
          <div class="space-y-3">
            <article v-for="meeting in customerMeetings" :key="meeting.id" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <router-link :to="{ name: 'MeetingDetail', params: { projectId: project.id, id: meeting.id } }" class="flex items-start justify-between gap-3 hover:opacity-80">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ meeting.title }}</h4>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ meeting.notes || 'Ingen notater' }}</p>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(meeting.date) }}</span>
              </router-link>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Deltakere: {{ formatAttendees(meeting.attendees) }}</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Krav: {{ (meeting.requirements || []).map((requirement) => requirement.title).join(', ') || 'Ingen' }}</p>
              <div class="mt-3 flex gap-2">
                <button class="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600" @click="openMeetingModal(meeting)">Rediger</button>
                <button class="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600" @click="handleDeleteMeeting(meeting)">Slett</button>
              </div>
            </article>
            <p v-if="!customerMeetings.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen kundemøter enda.</p>
          </div>
        </section>
      </div>

      <Modal v-model="showRequirementModal" :title="editingRequirement ? 'Rediger krav' : 'Nytt krav'">
        <RequirementForm :requirement="editingRequirement" :meetings="customerMeetings" @submit="editingRequirement ? handleUpdateRequirement($event) : handleCreateRequirement($event)" />
      </Modal>

      <Modal v-model="showMilestoneModal" :title="editingMilestone ? 'Rediger milepæl' : 'Ny milepæl'">
        <MilestoneForm :milestone="editingMilestone" @submit="editingMilestone ? handleUpdateMilestone($event) : handleCreateMilestone($event)" />
      </Modal>

      <Modal v-model="showMeetingModal" :title="editingMeeting ? 'Rediger kundemøte' : 'Nytt kundemøte'">
        <CustomerMeetingForm :meeting="editingMeeting" :members="projectMembers" @submit="editingMeeting ? handleUpdateMeeting($event) : handleCreateMeeting($event)" />
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Modal from '../../../components/Modal.vue'
import { useProjectsStore } from '../store.js'
import RequirementForm from '../components/RequirementForm.vue'
import MilestoneForm from '../components/MilestoneForm.vue'
import CustomerMeetingForm from '../components/CustomerMeetingForm.vue'

const route = useRoute()
const projectStore = useProjectsStore()

const editingRequirement = ref(null)
const editingMilestone = ref(null)
const editingMeeting = ref(null)
const showRequirementModal = ref(false)
const showMilestoneModal = ref(false)
const showMeetingModal = ref(false)

const project = computed(() => projectStore.planningProject)
const requirements = computed(() => project.value?.requirements || [])
const milestones = computed(() => project.value?.milestones || [])
const customerMeetings = computed(() => project.value?.customerMeetings || [])
const projectMembers = computed(() => project.value?.members || [])

async function loadPlanning() {
  const projectId = Number(route.params.id)
  if (!projectId) {
    return
  }

  await projectStore.fetchProjectPlanning(projectId)
}

watch(
  () => route.params.id,
  async () => {
    await loadPlanning()
  },
  { immediate: true }
)

const openRequirementModal = (requirement = null) => {
  editingRequirement.value = requirement
  showRequirementModal.value = true
}

const openMilestoneModal = (milestone = null) => {
  editingMilestone.value = milestone
  showMilestoneModal.value = true
}

const openMeetingModal = (meeting = null) => {
  editingMeeting.value = meeting
  showMeetingModal.value = true
}

watch(
  () => route.query.create,
  () => {
    const createTarget = String(route.query.create || '').toLowerCase()

    if (createTarget === 'requirement') {
      openRequirementModal()
    }

    if (createTarget === 'milestone') {
      openMilestoneModal()
    }

    if (createTarget === 'meeting') {
      openMeetingModal()
    }
  },
  { immediate: true }
)

const handleCreateRequirement = async (payload) => {
  const created = await projectStore.createRequirement(project.value.id, payload)
  if (!created) {
    return
  }

  await loadPlanning()
  showRequirementModal.value = false
}

const handleUpdateRequirement = async (payload) => {
  const updated = await projectStore.updateRequirement(project.value.id, editingRequirement.value.id, payload)
  if (!updated) {
    return
  }

  await loadPlanning()
  editingRequirement.value = null
  showRequirementModal.value = false
}

const handleDeleteRequirement = async (requirement) => {
  if (!confirm('Slette dette kravet?')) {
    return
  }

  await projectStore.deleteRequirement(project.value.id, requirement.id)
  await loadPlanning()
}

const handleCreateMilestone = async (payload) => {
  const created = await projectStore.createMilestone(project.value.id, payload)
  if (!created) {
    return
  }

  await loadPlanning()
  showMilestoneModal.value = false
}

const handleUpdateMilestone = async (payload) => {
  const updated = await projectStore.updateMilestone(project.value.id, editingMilestone.value.id, payload)
  if (!updated) {
    return
  }

  await loadPlanning()
  editingMilestone.value = null
  showMilestoneModal.value = false
}

const handleDeleteMilestone = async (milestone) => {
  if (!confirm('Slette denne milepælen?')) {
    return
  }

  await projectStore.deleteMilestone(project.value.id, milestone.id)
  await loadPlanning()
}

const handleCreateMeeting = async (payload) => {
  const created = await projectStore.createCustomerMeeting(project.value.id, payload)
  if (!created) {
    return
  }

  await loadPlanning()
  showMeetingModal.value = false
}

const handleUpdateMeeting = async (payload) => {
  const updated = await projectStore.updateCustomerMeeting(project.value.id, editingMeeting.value.id, payload)
  if (!updated) {
    return
  }

  await loadPlanning()
  editingMeeting.value = null
  showMeetingModal.value = false
}

const handleDeleteMeeting = async (meeting) => {
  if (!confirm('Slette dette møtet?')) {
    return
  }

  await projectStore.deleteCustomerMeeting(project.value.id, meeting.id)
  await loadPlanning()
}

const formatDate = (value) => {
  if (!value) {
    return 'Ikke satt'
  }

  return new Date(value).toLocaleDateString('no-NO')
}

const formatDateTime = (value) => {
  if (!value) {
    return 'Ikke satt'
  }

  return new Date(value).toLocaleString('no-NO')
}

const formatAttendees = (attendees = []) => {
  if (!attendees.length) {
    return 'Ingen deltakere'
  }

  return attendees.map((attendee) => attendee.githubLogin || attendee.email).join(', ')
}

const requirementStatusLabel = (status) => {
  const labels = {
    OPEN: 'Åpen',
    APPROVED: 'Godkjent',
    IMPLEMENTED: 'Implementert',
    REJECTED: 'Avvist'
  }

  return labels[status] || status
}
</script>