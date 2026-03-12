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

            <div class="space-y-4" v-if="project">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Features</h2>

                <router-link v-for="feature in project.features ?? []" :key="feature.id"
                    :to="{ name: 'FeatureTasks', params: { projectId: project.id, featureId: feature.id } }" class="block">
                    <FeatureCard :feature="feature" />
                </router-link>
            </div>

            <!-- Knapp for å åpne modal -->
            <div v-if="project" class="mt-4">
                <button @click="showModal = true" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                    Legg til ny feature
                </button>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-lg p-6 relative">
                <button @click="showModal = false"
                    class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    ✖
                </button>

                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Legg til ny feature</h3>


                <FeatureForm :projectModules="project.modules ?? []" :technologies="allTechnologies ?? []"
                    @submit="handleAddFeatureModal" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '../store.js'
import { useTechnologiesStore } from '../../technologies/store.js'
import FeatureCard from '../../features/components/FeatureCard.vue'
import FeatureForm from '../../features/components/FeatureForm.vue'

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

const handleAddFeatureModal = async (featureData) => {
    if (!project.value) return

    // Legg til feature via store
    const newFeature = await projectStore.addFeatureToModule(project.value.id, featureData)

    if (!project.value.features) project.value.features = []
    project.value.features.push(newFeature)

    showModal.value = false
}
</script>