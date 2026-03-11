<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-lg transition cursor-pointer relative">
        <!-- Project Title -->
        <div class="bg-gray-800 rounded-lg p-5 shadow">

            <div class="flex justify-between items-start mb-3">
                <h2 class="text-xl font-bold text-gray-100">{{ project.name }}</h2>

                <!-- Status badge -->
                <StatusBadge :status="project.status" />
            </div>

            <p class="text-gray-400">
                {{ project.description }}
            </p>

        </div>


        <p class="text-gray-600 dark:text-gray-400 mb-4">
            Deadline: {{ project.deadline ? new Date(project.deadline).toLocaleDateString('no-NO') : 'Ikke satt' }}
        </p>

        <div class="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
            <div class="bg-blue-500 h-3 rounded-full transition-all" :style="{ width: (project.progress ?? 0) + '%' }">
            </div>
        </div>

        <p class="mt-2 text-gray-700 dark:text-gray-300">{{ project.progress ?? 0 }}% ferdig</p>
        <button @click="$emit('delete', project.id)"
            class="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-400">
            🗑️
        </button>
    </div>

</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
defineProps({
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
defineEmits(['delete'])
</script>