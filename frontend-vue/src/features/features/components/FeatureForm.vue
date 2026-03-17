<template>
    <form @submit.prevent="submit" class="space-y-5">
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Navn</label>
            <input
                v-model="formData.name"
                required
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            />
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Beskrivelse</label>
            <textarea
                v-model="formData.description"
                rows="4"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            ></textarea>
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Modul</label>
            <select
                v-model="formData.moduleId"
                required
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            >
                <option value="" disabled>Velg modul</option>
                <option v-for="module in normalizedModules" :key="module.id" :value="module.id">
                    {{ module.name }}
                </option>
            </select>
        </div>

        <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Teknologier</label>

            <div class="flex flex-wrap gap-2">
                <button
                    v-for="tech in technologies"
                    :key="tech.id"
                    type="button"
                    @click="toggleTechnology(tech.id)"
                    class="rounded-full border px-3 py-1.5 text-sm transition"
                    :class="formData.technologyIds.includes(tech.id)
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-gray-500'"
                >
                    {{ tech.name }}
                </button>
            </div>
        </div>

        <div class="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
                {{ props.feature ? 'Oppdater feature' : 'Legg til feature' }}
            </button>
        </div>
    </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  feature: { type: Object, default: () => null },
  projectModules: { type: Array, default: () => [] },
  technologies: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit'])

const formData = ref({
    name: '',
    description: '',
    moduleId: '',
    technologyIds: []
})

const normalizedModules = computed(() =>
  (props.projectModules || [])
    .map((entry) => {
      const module = entry?.module ?? entry
      if (!module || module.id == null) return null
      return {
        id: Number(module.id),
        name: module.name ?? ''
      }
    })
    .filter(Boolean)
)

const submit = () => {
  emit('submit', {
    ...formData.value,
    id: props.feature?.id,
    moduleId: Number(formData.value.moduleId),
    technologyIds: formData.value.technologyIds.map(Number)
  })
}

watch(
  () => props.feature,
  (f) => {
    if (f) {
      formData.value = {
        name: f.name ?? '',
        description: f.description ?? '',
        moduleId: f.moduleId != null ? Number(f.moduleId) : '',
        technologyIds: (f.technologyIds ?? f.technologies ?? []).map(t =>
          typeof t === 'object' ? Number(t.id) : Number(t)
        )
      }
    } else {
      formData.value = {
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
  if (formData.value.technologyIds.includes(id)) {
    formData.value.technologyIds = formData.value.technologyIds.filter(t => t !== id)
  } else {
    formData.value.technologyIds.push(id)
  }
}
</script>
