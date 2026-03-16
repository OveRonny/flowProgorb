<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Technologies</h1>

            <TechnologyForm :types="technoStore.types" :typeLabels="technoStore.typeLabels"
                :technology="editingTechnology" :onSubmit="handleSubmit" :onCancel="cancelEdit" />

            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Technology List</h2>
            <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">

                <table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">

                 
                    <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                        <tr>
                            <th class="px-6 py-3">Name</th>
                            <th class="px-6 py-3">Type</th>
                            <th class="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                  
                    <tbody>

                        <tr v-for="tech in technoStore.technologies" :key="tech.id"
                            class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">

                            <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                {{ tech.name }}
                            </td>
                          
                            <td class="px-6 py-4">
                                {{ technoStore.typeLabels[tech.type] }}
                            </td>
                           
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">

                                    <button @click="startEdit(tech)" class="bg-blue-500 dark:bg-blue-600
                                   hover:bg-blue-600 dark:hover:bg-blue-700
                                   text-white text-sm font-semibold
                                   px-3 py-1 rounded transition">
                                        Edit
                                    </button>

                                    <button @click="deleteTechnology(tech.id)" class="bg-red-500 dark:bg-red-600
                                   hover:bg-red-600 dark:hover:bg-red-700
                                   text-white text-sm font-semibold
                                   px-3 py-1 rounded transition">
                                        Delete
                                    </button>

                                </div>
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useTechnologiesStore } from "../store.js";
import TechnologyForm from "../components/TechnologyForm.vue";

export default {
    components: { TechnologyForm },

    setup() {
        const technoStore = useTechnologiesStore();
        const editingTechnology = ref(null);

        onMounted(async () => {
            await technoStore.fetchTechnologyTypes();
            await technoStore.fetchTechnologies();
        });

        const handleSubmit = async (data) => {

            if (editingTechnology.value) {
                await technoStore.updateTechnology(editingTechnology.value.id, data);
                editingTechnology.value = null;
            } else {
                await technoStore.createTechnology(data);
            }
        };

        const startEdit = (tech) => {
            editingTechnology.value = { ...tech };
        };

        const cancelEdit = () => {
            editingTechnology.value = null;
        };

        const deleteTechnology = async (id) => {
            if (confirm("Are you sure you want to delete this technology?")) {
                await technoStore.deleteTechnology(id);
            }
        };

        return {
            technoStore,
            editingTechnology,
            handleSubmit,
            startEdit,
            cancelEdit,
            deleteTechnology
        };
    }
};
</script>