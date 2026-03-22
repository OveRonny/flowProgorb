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
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Beskrivelse</label>
      <textarea
        v-model="formData.description"
        rows="4"
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>
    <div class="grid gap-4 md:grid-cols-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prioritet</label>
        <input
          v-model="formData.priority"
          type="number"
          min="1"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Estimat (timer)</label>
        <input
          v-model="formData.estimatedHours"
          type="number"
          min="0"
          step="0.5"
          placeholder="F.eks. 0.5"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
        <select
          v-model="formData.status"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="OPEN">Åpen</option>
          <option value="APPROVED">Godkjent</option>
          <option value="IMPLEMENTED">Implementert</option>
          <option value="REJECTED">Avvist</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kundemøte</label>
        <select
          v-model="formData.meetingId"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">Ingen</option>
          <option v-for="meeting in meetings" :key="meeting.id" :value="String(meeting.id)">
            {{ meeting.title }}
          </option>
        </select>
      </div>
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Målversjon</label>
      <select
        v-model="formData.targetVersionId"
        required
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      >
        <option value="" disabled>Velg versjon</option>
        <option v-for="version in versions" :key="version.id" :value="String(version.id)">
          {{ version.versionTag }}{{ version.name ? ` - ${version.name}` : '' }}
        </option>
      </select>
      <p v-if="!versions.length" class="mt-1 text-xs text-amber-600 dark:text-amber-300">
        Du må opprette minst én versjon før du kan lagre krav.
      </p>
    </div>
    <div class="flex justify-end">
      <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        {{ requirement ? 'Oppdater krav' : 'Legg til krav' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  requirement: { type: Object, default: null },
  meetings: { type: Array, default: () => [] },
  versions: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit'])

const formData = ref({
  title: '',
  description: '',
  priority: '',
  estimatedHours: '',
  status: 'OPEN',
  meetingId: '',
  targetVersionId: ''
})

watch(
  () => props.requirement,
  (requirement) => {
    if (requirement) {
      formData.value = {
        title: requirement.title ?? '',
        description: requirement.description ?? '',
        priority: requirement.priority ?? '',
        estimatedHours: requirement.estimatedHours ?? '',
        status: requirement.status ?? 'OPEN',
        meetingId: requirement.meetingId != null ? String(requirement.meetingId) : '',
        targetVersionId: requirement.targetVersionId != null ? String(requirement.targetVersionId) : ''
      }
      return
    }

    formData.value = {
      title: '',
      description: '',
      priority: '',
      estimatedHours: '',
      status: 'OPEN',
      meetingId: '',
      targetVersionId: ''
    }
  },
  { immediate: true }
)

function submit() {
  if (formData.value.targetVersionId === '') {
    return
  }

  emit('submit', {
    ...formData.value,
    priority: formData.value.priority === '' ? null : Number(formData.value.priority),
    estimatedHours: formData.value.estimatedHours === '' ? null : Number(formData.value.estimatedHours),
    meetingId: formData.value.meetingId === '' ? null : Number(formData.value.meetingId),
    targetVersionId: formData.value.targetVersionId === '' ? null : Number(formData.value.targetVersionId)
  })
}
</script>