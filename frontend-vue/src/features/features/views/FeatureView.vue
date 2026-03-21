<template>
    <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
        <div class="mx-auto max-w-5xl space-y-6">
            <div v-if="project" class="rounded bg-white p-5 shadow dark:bg-gray-800">
                <h1 class="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-200">{{ project.name }}</h1>
                <p class="mb-2 text-gray-600 dark:text-gray-400">{{ project.description || 'Ingen beskrivelse' }}</p>
                <p class="text-gray-600 dark:text-gray-400">
                    Status: {{ project.status }} |
                    Frist: {{ project.deadline ? new Date(project.deadline).toLocaleDateString('no-NO') : 'Ikke satt' }}
                </p>
                <div class="mt-3 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div class="h-3 rounded-full bg-blue-500 transition-all" :style="{ width: projectProgressPercent + '%' }"></div>
                </div>
                <p class="mt-2 text-gray-700 dark:text-gray-300">{{ projectProgressPercent }}% ferdig</p>
            </div>

            <div v-if="project" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">GitHub Repo</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ githubRepoText }}</p>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                    <input
                        v-model="repoUrl"
                        placeholder="https://github.com/owner/repo"
                        class="min-w-65 flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    />
                    <button @click="connectGithubRepo" class="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black">Koble til</button>
                    <button @click="loadGithubRepo" class="rounded bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">Oppdater</button>
                </div>
                <p v-if="githubRepoInfo" class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ githubRepoInfo }}</p>
            </div>

            <p v-if="projectStore.error" class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {{ projectStore.error }}
            </p>

            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Funksjoner</h2>
                <router-link :to="{ name: 'ProjectPlanning', params: { id: project?.id } }" class="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
                    Åpne planlegging
                </router-link>
            </div>

            <button class="mb-4 rounded bg-blue-500 px-4 py-2 text-white" @click="showFeatureModal = true">Legg til funksjon</button>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <FeatureCard
                    v-for="feature in projectFeatures"
                    :key="feature.id"
                    :feature="feature"
                    @edit="handleEdit"
                    @delete="handleDelete"
                    @viewTasks="goToTasks(feature.id)"
                />
            </div>

            <p v-if="project && projectFeatures.length === 0 && !projectStore.loading" class="rounded border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Ingen funksjoner funnet for dette prosjektet.
            </p>

            <Modal v-model="showFeatureModal" :title="editingFeature ? 'Rediger funksjon' : 'Ny funksjon'">
                <FeatureForm
                    :key="editingFeature ? editingFeature.id : 'new'"
                    :feature="editingFeature"
                    :projectModules="modules"
                    :technologies="allTechnologies"
                    @submit="editingFeature ? handleUpdate($event) : handleCreate($event)"
                />
            </Modal>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '../../projects/store.js'
import { useTechnologiesStore } from '../../technologies/store.js'
import { useModulesStore } from '@/features/modules/store.js'
import { calculateTaskCollectionProgress } from '../../shared/progress.js'
import FeatureCard from '../components/FeatureCard.vue'
import FeatureForm from '../components/FeatureForm.vue'
import Modal from '../../../components/Modal.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectsStore()
const technoStore = useTechnologiesStore()
const moduleStore = useModulesStore()

const editingFeature = ref(null)
const showFeatureModal = ref(false)
const repoUrl = ref('')

const project = computed(() => projectStore.project)
const allTechnologies = computed(() => technoStore.technologies)
const projectFeatures = computed(() => (project.value?.features || []).filter((feature) => feature && feature.id != null))
const modules = computed(() => moduleStore.modules || [])

const githubRepoText = computed(() => {
    if (!project.value?.githubOwner || !project.value?.githubRepoName) {
        return 'Ikke tilkoblet'
    }

    return `${project.value.githubOwner}/${project.value.githubRepoName}`
})

const githubRepoInfo = computed(() => {
    const repo = projectStore.githubRepo?.repo
    if (!repo) {
        return ''
    }

    return `${repo.fullName} | standardgren: ${repo.defaultBranch}`
})

const projectProgressPercent = computed(() => {
    const features = projectFeatures.value
    const allTasks = features.flatMap((feature) => feature.tasks || [])

    if (allTasks.length > 0) {
        return calculateTaskCollectionProgress(allTasks)
    }

    if (features.length > 0) {
        const featureProgressSum = features.reduce((sum, feature) => sum + (Number(feature.progress) || 0), 0)
        return Math.round(featureProgressSum / features.length)
    }

    return Number(project.value?.progress) || 0
})

const goToTasks = (featureId) => {
    router.push({ path: `/features/${featureId}/tasks`, query: { projectId: project.value?.id } })
}

const loadFeaturePage = async () => {
    const projectId = Number(route.params.id)
    if (!projectId) {
        return
    }

    await projectStore.fetchProjectById(projectId)
    await Promise.allSettled([
        technoStore.fetchTechnologies(),
        moduleStore.fetchModules()
    ])

    if (projectStore.project?.githubOwner && projectStore.project?.githubRepoName) {
        repoUrl.value = projectStore.project.githubRepoUrl
        await projectStore.fetchGithubRepo(projectId)
    }
}

watch(
    () => route.params.id,
    async () => {
        await loadFeaturePage()
    },
    { immediate: true }
)

watch(
    () => route.query.create,
    () => {
        if (String(route.query.create || '').toLowerCase() === 'feature') {
            editingFeature.value = null
            showFeatureModal.value = true
        }
    },
    { immediate: true }
)

const handleCreate = async (feature) => {
    const created = await projectStore.createProjectFeature(project.value.id, feature)
    if (!created) {
        return
    }

    await projectStore.fetchProjectById(project.value.id)
    showFeatureModal.value = false
}

const handleEdit = (feature) => {
    editingFeature.value = feature
    showFeatureModal.value = true
}

const handleUpdate = async (feature) => {
    const updated = await projectStore.updateProjectFeature(project.value.id, editingFeature.value.id, {
        name: feature.name,
        description: feature.description,
        moduleId: feature.moduleId,
        technologyIds: feature.technologyIds
    })

    if (!updated) {
        return
    }

    await projectStore.fetchProjectById(project.value.id)
    editingFeature.value = null
    showFeatureModal.value = false
}

const handleDelete = async (feature) => {
    if (!confirm('Slette denne featuren?')) {
        return
    }

    await projectStore.deleteProjectFeature(project.value.id, feature.id)
    await projectStore.fetchProjectById(project.value.id)
}

const connectGithubRepo = async () => {
    const projectId = Number(project.value?.id)
    if (!projectId || !repoUrl.value.trim()) {
        return
    }

    const connectedRepo = await projectStore.connectGithubRepo(projectId, { repoUrl: repoUrl.value.trim() })
    if (!connectedRepo) {
        return
    }

    await Promise.allSettled([
        projectStore.fetchProjectById(projectId),
        projectStore.fetchGithubRepo(projectId)
    ])
}

const loadGithubRepo = async () => {
    const projectId = Number(project.value?.id)
    if (!projectId || !project.value?.githubOwner || !project.value?.githubRepoName) {
        return
    }

    await projectStore.fetchGithubRepo(projectId)
}

</script>
