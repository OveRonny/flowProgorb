<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Prosjektinfo -->
            <div v-if="project" class="bg-white dark:bg-gray-800 p-5 rounded shadow">
                <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{{ project.name }}</h1>
                <p class="text-gray-600 dark:text-gray-400 mb-2">{{ project.description || 'Ingen beskrivelse' }}</p>
                <p class="text-gray-600 dark:text-gray-400">
                    Status: {{ project.status }} |
                    Deadline: {{ project.deadline ? new Date(project.deadline).toLocaleDateString('no-NO') : 'Ikke satt'
                    }}
                </p>
                <div class="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full mt-3">
                    <div class="bg-blue-500 h-3 rounded-full transition-all"
                        :style="{ width: (project.progress ?? 0) + '%' }"></div>
                </div>
                <p class="mt-2 text-gray-700 dark:text-gray-300">{{ project.progress ?? 0 }}% ferdig</p>
            </div>
            <div>
                <h2>Features</h2>
                <button class="bg-blue-500 text-white px-4 py-2 rounded mb-4" @click="showModal = true">Legg til Feature</button>
            </div>

 </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '../../projects/store.js'
import { useTechnologiesStore } from '../../technologies/store.js'


const route = useRoute()
const projectStore = useProjectsStore()
const technoStore = useTechnologiesStore()

const allTechnologies = computed(() => technoStore.technologies)

const project = ref(null)
const showModal = ref(false)

onMounted(async () => {
    const projectId = Number(route.params.id)

    // Hent prosjekt med features og moduler
    await projectStore.fetchProjectById(projectId)
    project.value = projectStore.project

    // Hent alle teknologier
    await technoStore.fetchTechnologies()
})

/* const handleAddFeatureModal = async (featureData) => {
    if (!project.value) return

    // Legg til feature via store
    const newFeature = await projectStore.addFeatureToModule(project.value.id, featureData)

    if (!project.value.features) project.value.features = []
    project.value.features.push(newFeature)

    showModal.value = false
} */
</script>