<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
        <h1 class="text-2xl font-bold text-amber-900 dark:text-amber-100">Start med planlegging</h1>
        <p class="mt-1 text-sm text-amber-800 dark:text-amber-200">
          Her kan du planlegge krav, milepæler og kundemøter før prosjektet opprettes.
        </p>
      </div>

      <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Prosjektinfo (opprettes ved lagring)</h2>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prosjektnavn</label>
            <input
              v-model="draft.name"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="F.eks. Ny kundeportal"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
            <input
              v-model="draft.deadline"
              type="date"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
        <div class="mt-4">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Beskrivelse</label>
          <textarea
            v-model="draft.description"
            rows="3"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Hva skal leveres i prosjektet?"
          />
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-3">
        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Krav</h3>
            <button class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700" @click="addRequirement">Nytt krav</button>
          </div>
          <div class="space-y-3">
            <div v-for="(requirement, index) in draft.requirements" :key="`req-${index}`" class="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <input
                v-model="requirement.title"
                type="text"
                placeholder="Kravtittel"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <textarea
                v-model="requirement.description"
                rows="2"
                placeholder="Beskrivelse"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <button class="text-xs font-medium text-red-600 hover:text-red-700" @click="removeRequirement(index)">Fjern</button>
            </div>
            <p v-if="!draft.requirements.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen krav lagt til.</p>
          </div>
        </article>

        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Milepæler</h3>
            <button class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700" @click="addMilestone">Ny milepæl</button>
          </div>
          <div class="space-y-3">
            <div v-for="(milestone, index) in draft.milestones" :key="`milestone-${index}`" class="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <input
                v-model="milestone.title"
                type="text"
                placeholder="Milepæl"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <input
                v-model="milestone.dueDate"
                type="date"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <textarea
                v-model="milestone.description"
                rows="2"
                placeholder="Beskrivelse"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <button class="text-xs font-medium text-red-600 hover:text-red-700" @click="removeMilestone(index)">Fjern</button>
            </div>
            <p v-if="!draft.milestones.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen milepæler lagt til.</p>
          </div>
        </article>

        <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Kundemøter</h3>
            <button class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700" @click="addMeeting">Nytt møte</button>
          </div>
          <div class="space-y-3">
            <div v-for="(meeting, index) in draft.meetings" :key="`meeting-${index}`" class="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <input
                v-model="meeting.title"
                type="text"
                placeholder="Møtetittel"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <input
                v-model="meeting.date"
                type="datetime-local"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <textarea
                v-model="meeting.notes"
                rows="2"
                placeholder="Notater"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <button class="text-xs font-medium text-red-600 hover:text-red-700" @click="removeMeeting(index)">Fjern</button>
            </div>
            <p v-if="!draft.meetings.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen kundemøter lagt til.</p>
          </div>
        </article>
      </section>

      <p v-if="error" class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        {{ error }}
      </p>

      <div class="flex flex-wrap gap-3">
        <button
          :disabled="saving"
          class="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="savePlanning"
        >
          {{ saving ? 'Lagrer...' : 'Opprett prosjekt fra plan' }}
        </button>
        <router-link to="/planning-overview" class="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
          Se eksisterende planlegging
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../../projects/store.js'

const router = useRouter()
const projectStore = useProjectsStore()
const saving = ref(false)
const error = ref('')

const draft = reactive({
  name: '',
  description: '',
  deadline: '',
  requirements: [],
  milestones: [],
  meetings: []
})

function addRequirement() {
  draft.requirements.push({ title: '', description: '', priority: null })
}

function removeRequirement(index) {
  draft.requirements.splice(index, 1)
}

function addMilestone() {
  draft.milestones.push({ title: '', description: '', dueDate: '', orderIndex: null })
}

function removeMilestone(index) {
  draft.milestones.splice(index, 1)
}

function addMeeting() {
  draft.meetings.push({ title: '', notes: '', date: '' })
}

function removeMeeting(index) {
  draft.meetings.splice(index, 1)
}

async function savePlanning() {
  error.value = ''

  const projectName = String(draft.name || '').trim()
  if (!projectName) {
    error.value = 'Prosjektnavn er påkrevd for å lagre planen.'
    return
  }

  saving.value = true
  try {
    const createdProject = await projectStore.createProjectFromPlanningDraft({
      name: projectName,
      description: String(draft.description || '').trim(),
      deadline: draft.deadline || null,
      requirements: draft.requirements
        .map((entry) => ({
          title: String(entry.title || '').trim(),
          description: String(entry.description || '').trim(),
          priority: entry.priority
        }))
        .filter((entry) => entry.title),
      milestones: draft.milestones
        .map((entry) => ({
          title: String(entry.title || '').trim(),
          description: String(entry.description || '').trim(),
          dueDate: entry.dueDate || null,
          orderIndex: entry.orderIndex
        }))
        .filter((entry) => entry.title),
      meetings: draft.meetings
        .map((entry) => ({
          title: String(entry.title || '').trim(),
          notes: String(entry.notes || '').trim(),
          date: entry.date || null
        }))
        .filter((entry) => entry.title)
    })

    if (!createdProject?.id) {
      throw new Error(projectStore.error || 'Klarte ikke å opprette prosjekt fra plan')
    }

    router.push({ name: 'ProjectPlanning', params: { id: createdProject.id } })
  } catch (err) {
    error.value = err?.message || 'Noe gikk galt under lagring'
  } finally {
    saving.value = false
  }
}
</script>
