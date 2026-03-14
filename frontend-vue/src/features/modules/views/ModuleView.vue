<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Modules</h1>
            <ModuleForm :module="editingModule" :onSubmit="handleSubmit" :onCancel="cancelEdit" />

            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Modules list</h2>
            <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">

                    <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                        <tr>
                            <th class="px-6 py-3">Name</th>
                            <th class="px-6 py-3">Description</th>
                            <th class="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr v-for="mod in moduleStore.modules" :key="mod.id"
                            class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">

                            <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                {{ mod.name }}
                            </td>

                            <td class="px-6 py-4">
                                {{ mod.description }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">

                                    <button @click="startEdit(mod)" class="bg-blue-500 dark:bg-blue-600
                                   hover:bg-blue-600 dark:hover:bg-blue-700
                                   text-white text-sm font-semibold
                                   px-3 py-1 rounded transition">
                                        Edit
                                    </button>

                                    <button @click="deleteModule(mod.id)" class="bg-red-500 dark:bg-red-600
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
import { useModulesStore } from "../store.js";
import ModuleForm from "../components/ModuleForm.vue";

export default {
    components: { ModuleForm },

    setup() {
        const moduleStore = useModulesStore();
        const editingModule = ref(null);

        onMounted( async () => {
           await moduleStore.fetchModules();
        });

        const handleSubmit = async (data) => {
            if (editingModule.value) {
                await moduleStore.updateModule(editingModule.value.id, data);
            } else {
                await moduleStore.createModule(data);
            }

        };

        const startEdit = (mod) => {
            editingModule.value = { ...mod };
        };

        const deleteModule = async (id) => {
            if (!confirm("Are you sure you want to delete this module?")) return;
            await moduleStore.deleteModule(id);
        };

        const cancelEdit = () => {
            editingModule.value = null;
        };

        return {
            moduleStore,
            handleSubmit,
            cancelEdit,
            deleteModule,
            startEdit,
            editingModule
        };
    }



};




</script>