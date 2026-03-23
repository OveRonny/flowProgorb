<template>
    <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
        <div class="mx-auto max-w-5xl space-y-6">
            <div v-if="project" class="rounded bg-white p-5 shadow dark:bg-gray-800">
                <h1 class="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-200">{{ project.name }}</h1>
                <p class="mb-2 text-gray-600 dark:text-gray-400">{{ project.description || 'Ingen beskrivelse' }}</p>
                <p class="text-gray-600 dark:text-gray-400">
                    Status: {{ projectStatusLabel(project.status) }} |
                    Frist: {{ project.deadline ? new Date(project.deadline).toLocaleDateString('no-NO') : 'Ikke satt' }}
                </p>
                <div class="mt-3 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div class="h-3 rounded-full bg-blue-500 transition-all" :style="{ width: projectProgressPercent + '%' }"></div>
                </div>
                <p class="mt-2 text-gray-700 dark:text-gray-300">{{ projectProgressPercent }}% ferdig</p>
            </div>

            <div v-if="project" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Prosjektpris</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Timepris og prosjektpris gjelder hele prosjektet og brukes i kostnads- og lønnsomhetsberegninger.</p>
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Timepris (kr/time)</label>
                        <input
                            v-model="hourlyRateInput"
                            type="number"
                            min="1"
                            placeholder="Kr per time"
                            class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prosjektpris (kr)</label>
                        <input
                            v-model="offerPriceInput"
                            type="number"
                            min="1"
                            placeholder="Totalt tilbud"
                            class="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>
                </div>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                    <button
                        @click="saveProjectPricing"
                        :disabled="savingPricing || !canSavePricing"
                        class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {{ savingPricing ? 'Lagrer...' : 'Lagre priser' }}
                    </button>
                </div>
                <div class="mt-2 flex flex-wrap gap-3 text-xs">
                    <p v-if="projectHourlyRate" class="text-gray-600 dark:text-gray-300">Aktiv timepris: {{ formatCurrency(projectHourlyRate) }} / time</p>
                    <p v-else class="text-amber-700 dark:text-amber-300">Ingen timepris satt på prosjektet ennå.</p>
                    <p v-if="projectOfferPrice" class="text-gray-600 dark:text-gray-300">Aktiv prosjektpris: {{ formatCurrency(projectOfferPrice) }}</p>
                    <p v-else class="text-amber-700 dark:text-amber-300">Ingen prosjektpris satt på prosjektet ennå.</p>
                </div>
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

            <div v-if="project" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Release vs Development</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Publiser GitHub release fra utvikling. Bruk prerelease for utviklingsversjoner.
                </p>

                <div v-if="latestReleaseText" class="mt-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                    {{ latestReleaseText }}
                </div>

                <div class="mt-3 grid gap-2 md:grid-cols-2">
                    <input
                        v-model="releaseTag"
                        placeholder="Tag (f.eks. v1.0.0)"
                        class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    />
                    <input
                        v-model="releaseName"
                        placeholder="Navn (valgfritt)"
                        class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>

                <textarea
                    v-model="releaseNotes"
                    rows="3"
                    placeholder="Release notes (valgfritt)"
                    class="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />

                <div class="mt-2 flex flex-wrap items-center gap-4">
                    <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input v-model="isPrerelease" type="checkbox" />
                        Development prerelease
                    </label>
                    <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input v-model="generateReleaseNotes" type="checkbox" />
                        Generer release-notater automatisk
                    </label>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-2">
                    <button
                        @click="publishRelease"
                        class="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Publiser release
                    </button>
                    <a
                        v-if="latestReleaseUrl"
                        :href="latestReleaseUrl"
                        target="_blank"
                        rel="noreferrer"
                        class="rounded bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                        Åpne siste release
                    </a>
                </div>
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
import { confirmDialog } from '../../shared/confirmDialog.js'
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
const releaseTag = ref('')
const releaseName = ref('')
const releaseNotes = ref('')
const isPrerelease = ref(false)
const generateReleaseNotes = ref(true)
const hourlyRateInput = ref('')
const offerPriceInput = ref('')
const savingPricing = ref(false)

const project = computed(() => projectStore.project)
const allTechnologies = computed(() => technoStore.technologies)
const projectFeatures = computed(() => (project.value?.features || []).filter((feature) => feature && feature.id != null))
const modules = computed(() => moduleStore.modules || [])
const projectHourlyRate = computed(() => {
    const value = Number(project.value?.hourlyRate)
    if (!Number.isFinite(value) || value <= 0) {
        return null
    }

    return value
})
const projectOfferPrice = computed(() => {
    const value = Number(project.value?.offerPrice)
    if (!Number.isFinite(value) || value <= 0) {
        return null
    }

    return value
})
const hasValidPricingInput = (value) => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed) {
        return true
    }

    const parsed = Number(trimmed)
    return Number.isInteger(parsed) && parsed > 0
}
const canSavePricing = computed(() => {
    const hourlyChanged = String(hourlyRateInput.value ?? '') !== String(project.value?.hourlyRate ?? '')
    const offerChanged = String(offerPriceInput.value ?? '') !== String(project.value?.offerPrice ?? '')

    if (!hourlyChanged && !offerChanged) {
        return false
    }

    return hasValidPricingInput(hourlyRateInput.value) && hasValidPricingInput(offerPriceInput.value)
})

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

const latestReleaseText = computed(() => {
    const latest = projectStore.githubRepo?.latestRelease
    if (!latest?.tagName) {
        return 'Ingen release publisert enda.'
    }

    const type = latest.prerelease ? 'Development prerelease' : 'Production release'
    return `Siste release: ${latest.tagName} (${type})`
})

const latestReleaseUrl = computed(() => projectStore.githubRepo?.latestRelease?.htmlUrl || '')

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

const projectStatusLabel = (status) => {
    const labels = {
        PLANNED: 'Planlagt',
        ACTIVE: 'Aktiv',
        COMPLETED: 'Fullført',
        ON_HOLD: 'På vent'
    }

    return labels[status] || status
}

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

watch(
    () => project.value?.hourlyRate,
    (value) => {
        hourlyRateInput.value = value ? String(value) : ''
    },
    { immediate: true }
)

watch(
    () => project.value?.offerPrice,
    (value) => {
        offerPriceInput.value = value ? String(value) : ''
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
    const confirmed = await confirmDialog.open({
        title: 'Slett funksjon',
        message: `Slette funksjonen ${feature.name}?`,
        details: 'Funksjonen blir fjernet fra prosjektet.',
        confirmText: 'Slett',
        tone: 'danger'
    })
    if (!confirmed) {
        return
    }

    await projectStore.deleteProjectFeature(project.value.id, feature.id)
    await projectStore.fetchProjectById(project.value.id)
}

const saveProjectPricing = async () => {
    const projectId = Number(project.value?.id)
    if (!projectId || !canSavePricing.value) {
        return
    }

    savingPricing.value = true
    try {
        const updated = await projectStore.updateProject(projectId, {
            hourlyRate: hourlyRateInput.value === '' ? null : Number(hourlyRateInput.value),
            offerPrice: offerPriceInput.value === '' ? null : Number(offerPriceInput.value)
        })
        if (!updated) {
            return
        }

        await projectStore.fetchProjectById(projectId)
    } finally {
        savingPricing.value = false
    }
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

const publishRelease = async () => {
    const projectId = Number(project.value?.id)
    const tagName = releaseTag.value.trim()

    if (!projectId || !tagName) {
        return
    }

    const createdRelease = await projectStore.publishGithubRelease(projectId, {
        tagName,
        name: releaseName.value.trim() || null,
        body: releaseNotes.value,
        prerelease: isPrerelease.value,
        generateReleaseNotes: generateReleaseNotes.value
    })

    if (!createdRelease) {
        return
    }

    await projectStore.fetchGithubRepo(projectId)

    releaseTag.value = ''
    releaseName.value = ''
    releaseNotes.value = ''
}

const formatCurrency = (value) => new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
}).format(Number(value) || 0)

</script>
