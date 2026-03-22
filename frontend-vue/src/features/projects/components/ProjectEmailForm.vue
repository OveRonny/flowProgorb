<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Emne</label>
      <input
        v-model="formData.subject"
        required
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Avsender</label>
        <input
          v-model="formData.sender"
          placeholder="kundekontakt@firma.no"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sendt dato</label>
        <input
          v-model="formData.sentAt"
          type="datetime-local"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mottakere</label>
      <input
        v-model="formData.recipients"
        placeholder="navn@firma.no, team@firma.no"
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Skill flere mottakere med komma.</p>
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sammendrag</label>
      <textarea
        v-model="formData.summary"
        rows="5"
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </div>
    <div class="flex justify-end">
      <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        {{ emailEntry ? 'Oppdater e-post' : 'Lagre e-post' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  emailEntry: { type: Object, default: null }
})

const emit = defineEmits(['submit'])

const formData = ref({
  subject: '',
  sender: '',
  recipients: '',
  summary: '',
  sentAt: ''
})

watch(
  () => props.emailEntry,
  (emailEntry) => {
    if (emailEntry) {
      formData.value = {
        subject: emailEntry.subject ?? '',
        sender: emailEntry.sender ?? '',
        recipients: (emailEntry.recipients || []).join(', '),
        summary: emailEntry.summary ?? '',
        sentAt: emailEntry.sentAt ? new Date(emailEntry.sentAt).toISOString().slice(0, 16) : ''
      }
      return
    }

    formData.value = {
      subject: '',
      sender: '',
      recipients: '',
      summary: '',
      sentAt: ''
    }
  },
  { immediate: true }
)

function submit() {
  emit('submit', {
    subject: formData.value.subject,
    sender: formData.value.sender || null,
    recipients: formData.value.recipients
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
    summary: formData.value.summary || null,
    sentAt: formData.value.sentAt || null
  })
}
</script>
