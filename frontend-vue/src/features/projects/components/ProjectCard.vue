<template>
    <div @click="$emit('click')" class="bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-lg transition cursor-pointer relative">
        <!-- Project Title -->
        <div class="bg-gray-800 rounded-lg p-5 shadow">

            <div class="flex justify-between items-start mb-3">
                <h2 class="text-xl font-bold text-gray-100">{{ project.name }}</h2>

                <!-- Status badge -->
                <StatusBadge :status="project.status" />
            </div>

            <div class="mb-3">
                <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="isGithubConnected
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
                >
                    {{ isGithubConnected ? 'GitHub tilkoblet' : 'GitHub ikke tilkoblet' }}
                </span>
            </div>

            <p class="text-gray-400">
                {{ project.description }}
            </p>

        </div>


        <p class="text-gray-600 dark:text-gray-400 mb-4">
            Frist: {{ project.deadline ? new Date(project.deadline).toLocaleDateString('no-NO') : 'Ikke satt' }}
        </p>
        <div class="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div class="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-900/20">
                <p class="text-xs font-semibold text-blue-700 dark:text-blue-300">Timepris</p>
                <p class="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                    {{ projectHourlyRate ? `${formatCurrency(projectHourlyRate)} / time` : 'Ikke satt' }}
                </p>
            </div>
            <div class="rounded-md border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900/40 dark:bg-sky-900/20">
                <p class="text-xs font-semibold text-sky-700 dark:text-sky-300">Tilbudspris</p>
                <p class="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                    {{ projectOfferPrice ? formatCurrency(projectOfferPrice) : 'Ikke satt' }}
                </p>
            </div>
        </div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fremdrift</h4>
        <div class="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
            
            <div class="bg-blue-500 h-3 rounded-full transition-all" :style="{ width: projectProgress + '%' }">
            </div>
        </div>

        <p class="mt-2 text-gray-700 dark:text-gray-300">{{ projectProgress }}% ferdig</p>
        <button @click.stop="$emit('delete', project.id)"
            class="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-400">
            🗑️
        </button>
    </div>

</template>

<script setup>
import StatusBadge from '../../../components/StatusBadge.vue'
import { computed } from 'vue'
import { calculateTaskCollectionProgress } from '../../shared/progress.js'

const props = defineProps({
    project: {
        type: Object,
        required: true,
        default: () => ({
            name: 'Nytt prosjekt',
            description: 'Ingen beskrivelse',
            status: 'Planning',
            deadline: '2026-03-20',
            progress: 0
        })
    }
})

const projectProgress = computed(() => {
    const features = props.project?.features || []
    const allTasks = features.flatMap(feature => feature.tasks || [])

    if (allTasks.length > 0) {
        return calculateTaskCollectionProgress(allTasks)
    }

    if (features.length > 0) {
        const featureSum = features.reduce((sum, feature) => sum + (Number(feature.progress) || 0), 0)
        return Math.round(featureSum / features.length)
    }

    return Number(props.project?.progress) || 0
})

const isGithubConnected = computed(() =>
    Boolean(props.project?.githubOwner && props.project?.githubRepoName)
)

const projectHourlyRate = computed(() => {
    const value = Number(props.project?.hourlyRate)
    return Number.isFinite(value) && value > 0 ? value : null
})

const projectOfferPrice = computed(() => {
    const value = Number(props.project?.offerPrice)
    return Number.isFinite(value) && value > 0 ? value : null
})

const formatCurrency = (value) => new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
}).format(Number(value) || 0)

defineEmits(['click', 'delete'])
</script>