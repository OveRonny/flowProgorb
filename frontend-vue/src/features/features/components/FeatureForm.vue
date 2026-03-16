<template>
    <form @submit.prevent="submit" class="space-y-2">
        <div>
            <label class="block text-gray-700 dark:text-gray-300">Navn</label>
            <input v-model="feature.name" required
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>

        <div>
            <label class="block text-gray-700 dark:text-gray-300">Beskrivelse</label>
            <textarea v-model="feature.description"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
        </div>

        <div>
            <label class="block text-gray-700 dark:text-gray-300">Modul</label>
            <select v-model="feature.moduleId" required
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="" disabled>Velg modul</option>
                <option v-for="pm in projectModules" :key="pm.id" :value="pm.module.id">
                    {{ pm.module.name }}
                </option>
            </select>
        </div>

        <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2">Teknologier</label>

            <div class="flex flex-wrap gap-2">
                <button v-for="tech in technologies" :key="tech.id" type="button" @click="toggleTechnology(tech.id)"
                    :class="[
                        'px-3 py-1 rounded border text-sm',
                        feature.technologyIds.includes(tech.id)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                    ]">
                    {{ tech.name }}
                </button>
            </div>
        </div>

        <button type="submit" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
            Legg til
        </button>
    </form>

</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    feature: Object,
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
  emit('submit', {
    ...feature.value,
    id: props.feature?.id, 
    technologyIds: feature.value.technologyIds.map(Number) 
  })
}

watch(
  () => props.feature,
  (f) => {
    if (f) {
      feature.value = {
        name: f.name ?? '',
        description: f.description ?? '',
        moduleId: Number(f.moduleId) ?? '',
        technologyIds: (f.technologyIds ?? f.technologies ?? []).map(t =>
          typeof t === 'object' ? Number(t.id) : Number(t)
        )
      }
    } else {
      feature.value = {
        name: '',
        description: '',
        moduleId: '',
        technologyIds: []
      }
    }
  },
  { immediate: true }
)


const toggleTechnology = (id) => {
  id = Number(id)
  if (feature.value.technologyIds.includes(id)) {
    feature.value.technologyIds = feature.value.technologyIds.filter(t => t !== id)
  } else {
    feature.value.technologyIds.push(id)
  }
}
</script>