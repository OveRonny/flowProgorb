<template>
  <form @submit.prevent="submit" class="space-y-2">
    <div>
      <label class="block text-gray-700 dark:text-gray-300">Navn</label>
      <input
        v-model="feature.name"
        required
        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300">Beskrivelse</label>
      <textarea
        v-model="feature.description"
        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      ></textarea>
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300">Modul</label>
      <select
        v-model="feature.moduleId"
        required
        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="" disabled>Velg modul</option>
        <option v-for="pm in projectModules" :key="pm.id" :value="pm.module.id">
          {{ pm.module.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-gray-700 dark:text-gray-300">Teknologier</label>
      <select
        v-model="feature.technologyIds"
        multiple
        class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option v-for="tech in technologies" :key="tech.id" :value="tech.id">{{ tech.name }}</option>
      </select>
    </div>
    
    <button
      type="submit"
      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
    >
      Legg til
    </button>
  </form>
 
</template>

<script setup>
import { ref, watchEffect } from 'vue'

defineProps({
  projectModules: { type: Array, required: true },
  technologies: { type: Array, required: true }
})

const emit = defineEmits(['submit'])

const feature = ref({
  name: '',
  description: '',
  moduleId: '',
  technologyIds: []
})

const submit = () => {
  emit('submit', feature.value)

  feature.value.name = ''
  feature.value.description = ''
  feature.value.moduleId = ''
  feature.value.technologyIds = []
}
</script>