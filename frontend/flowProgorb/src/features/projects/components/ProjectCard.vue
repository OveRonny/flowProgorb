<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-lg transition cursor-pointer relative">
        <!-- Project Title -->
        <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{{ project.name }}</h2>

        <!-- Project Description -->
        <p class="text-gray-700 dark:text-gray-300 mb-2">{{ project.description }}</p>

        <!-- Project Status (default "Planning") -->
        <p class="text-gray-700 dark:text-gray-300 mb-2">
            Status: {{ project.status ?? 'Planning' }}
        </p>

        <!-- Project Deadline (default "Ikke satt") -->
        <p class="text-gray-600 dark:text-gray-400 mb-4">
            Deadline: {{ project.deadline ?? 'Ikke satt' }}
        </p>

        <!-- Progress Bar (default 0) -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
            <div class="bg-blue-500 h-3 rounded-full transition-all" :style="{ width: (project.progress ?? 0) + '%' }">
            </div>
        </div>

        <!-- Progress text -->
        <p class="mt-2 text-gray-700 dark:text-gray-300">{{ project.progress ?? 0 }}% ferdig</p>
        <button @click="$emit('delete', project.id)"
            class="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-400">
            🗑️
        </button>
    </div>

</template>

<script setup>
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