<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Technologies</h1>

            <TechnologyForm :types="technoStore.types" :typeLabels="technoStore.typeLabels" :onSubmit="handleCreate" />

            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Technology List</h2>
            <ul class="bg-white dark:bg-gray-800 shadow-md rounded p-4">
                <li v-for="tech in technoStore.technologies" :key="tech.id"
                    class="py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 flex justify-between">
                    <span class="text-gray-900 dark:text-gray-100">{{ tech.name }}</span>
                    <span class="text-gray-500 dark:text-gray-400">
                        {{ technoStore.typeLabels[tech.type] || tech.type }}
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { onMounted } from "vue";
import { useTechnologiesStore } from "../store.js";
import TechnologyForm from "../components/TechnologyForm.vue";



export default {
    components: { TechnologyForm },
    setup() {
        const technoStore = useTechnologiesStore();

        onMounted(async () => {
            await technoStore.fetchTechnologyTypes();
            await technoStore.fetchTechnologies();
        });

        const handleCreate = async (data) => {
            await technoStore.createTechnology(data);
        };

        return { technoStore, handleCreate };
    }
};
</script>