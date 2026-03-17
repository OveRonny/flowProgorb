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
                    {{ isGithubConnected ? 'GitHub connected' : 'GitHub not connected' }}
                </span>
            </div>

            <p class="text-gray-400">
                {{ project.description }}
            </p>

        </div>


        <p class="text-gray-600 dark:text-gray-400 mb-4">
            Deadline: {{ project.deadline ? new Date(project.deadline).toLocaleDateString('no-NO') : 'Ikke satt' }}
        </p>
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

defineEmits(['click', 'delete'])
</script>