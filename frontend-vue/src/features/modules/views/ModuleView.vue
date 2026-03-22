<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Moduler</h1>
            <ModuleForm
                :module="editingModule"
                :projects="projectStore.projects"
                :onSubmit="handleSubmit"
                :onCancel="cancelEdit"
            />

            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Modulliste</h2>
            <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">

                    <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                        <tr>
                            <th class="px-6 py-3">Navn</th>
                            <th class="px-6 py-3">Beskrivelse</th>
                            <th class="px-6 py-3 text-center">Handlinger</th>
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
                                        Rediger
                                    </button>

                                    <button @click="deleteModule(mod.id)" class="bg-red-500 dark:bg-red-600
                                   hover:bg-red-600 dark:hover:bg-red-700
                                   text-white text-sm font-semibold
                                   px-3 py-1 rounded transition">
                                        Slett
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
import { useProjectsStore } from "../../projects/store.js";
import ModuleForm from "../components/ModuleForm.vue";
import { confirmDialog } from "../../shared/confirmDialog.js";

export default {
    components: { ModuleForm },

    setup() {
        const moduleStore = useModulesStore();
          const projectStore = useProjectsStore();
        const editingModule = ref(null);

        onMounted( async () => {
           await moduleStore.fetchModules();
              await projectStore.fetchProjects();
        });

        const handleSubmit = async (data) => {
            if (editingModule.value) {
                const updated = await moduleStore.updateModule(editingModule.value.id, data);
                if (!updated) {
                    return;
                }
            } else {
                const created = await moduleStore.createModule(data);
                if (!created) {
                    return;
                }
            }

            editingModule.value = null;
            await moduleStore.fetchModules();

        };

        const startEdit = (mod) => {
            editingModule.value = { ...mod };
        };

        const deleteModule = async (id) => {
            const moduleEntry = moduleStore.modules.find((entry) => entry.id === id);
            const confirmed = await confirmDialog.open({
                title: 'Slett modul',
                message: `Slette modulen ${moduleEntry?.name || ''}?`,
                details: 'Modulen blir fjernet fra oversikten.',
                confirmText: 'Slett',
                tone: 'danger'
            });
            if (!confirmed) return;
            await moduleStore.deleteModule(id);
        };

        const cancelEdit = () => {
            editingModule.value = null;
        };

        return {
            moduleStore,
            projectStore,
            handleSubmit,
            cancelEdit,
            deleteModule,
            startEdit,
            editingModule
        };
    }



};




</script>