<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div class="max-w-4xl mx-auto space-y-6">
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
                <button class="bg-blue-500 text-white px-4 py-2 rounded mb-4" @click="showModal = true">Legg til
                    Feature</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard v-for="feature in projectFeatures" :key="feature.id" :feature="feature" @edit="handleEdit"
                    @delete="handleDelete" />
            </div>
            <Modal v-model="showModal" :title="editingFeature ? 'Rediger Feature' : 'Ny Feature'">
                <FeatureForm :key="editingFeature ? editingFeature.id : 'new'" :feature="editingFeature"
                    :projectModules="project?.modules ?? []" :technologies="allTechnologies"
                    @submit="editingFeature ? handleUpdate($event) : handleCreate($event)" />
            </Modal>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '../../projects/store.js'
import { useTechnologiesStore } from '../../technologies/store.js'
import FeatureCard from '../components/FeatureCard.vue'
import FeatureForm from '../components/FeatureForm.vue'
import Modal from '../../../components/Modal.vue'

const route = useRoute()
const projectStore = useProjectsStore()
const technoStore = useTechnologiesStore()
const editingFeature = ref(null)

const allTechnologies = computed(() => technoStore.technologies)
const projectFeatures = computed(() => (project.value?.features || []).filter(feature => feature && feature.id != null))

const project = ref(null)
const showModal = ref(false)

onMounted(async () => {
    const projectId = Number(route.params.id)

    await projectStore.fetchProjectById(projectId)
    project.value = projectStore.project

    await technoStore.fetchTechnologies()
})

const handleCreate = async (feature) => {
    await projectStore.createProjectFeature(project.value.id, feature)

    await projectStore.fetchProjectById(project.value.id)
    project.value = projectStore.project

    showModal.value = false
}

const handleEdit = async (feature) => {
    editingFeature.value = feature
    showModal.value = true
}

const handleUpdate = async (feature) => {
    const featureId = editingFeature.value.id

    await projectStore.updateProjectFeature(
        project.value.id,
        featureId,
        {
          name: feature.name,
          description: feature.description,
          moduleId: feature.moduleId,
          technologyIds: feature.technologyIds 
        }
    )

    await projectStore.fetchProjectById(project.value.id)
    project.value = projectStore.project

    editingFeature.value = null
    showModal.value = false
}

const handleDelete = async (feature) => {
    if (confirm('Slette denne featuren?')) {
        await projectStore.deleteProjectFeature(project.value.id, feature.id)

        // Refresh project data to remove deleted feature
        await projectStore.fetchProjectById(project.value.id)
        project.value = projectStore.project
    }
}
</script>