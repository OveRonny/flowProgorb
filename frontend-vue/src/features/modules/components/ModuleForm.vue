<template>
    <form @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {{ isEditing ? "Rediger modul" : "Legg til modul" }}
        </h2>

        <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1">
                Navn
            </label>

            <input v-model="form.name" placeholder="Navn" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded
                   bg-gray-50 dark:bg-gray-700
                   text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1">
                Prosjekt
            </label>

            <select v-model="form.projectId" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded
                   bg-gray-50 dark:bg-gray-700
                   text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option disabled value="">Velg prosjekt</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                </option>
            </select>
        </div>
         <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1">
                Beskrivelse
            </label>

            <input v-model="form.description" placeholder="Beskrivelse" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded
                   bg-gray-50 dark:bg-gray-700
                   text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex gap-2">

        <button
            type="submit"
            class="bg-blue-500 dark:bg-blue-600
                   hover:bg-blue-600 dark:hover:bg-blue-700
                   text-white font-semibold py-2 px-4 rounded
                   transition"
        >
            {{ isEditing ? "Oppdater" : "Lagre" }}
        </button>

        <button
            v-if="isEditing"
            type="button"
            @click="onCancel"
            class="bg-gray-300 dark:bg-gray-600
                   hover:bg-gray-400 dark:hover:bg-gray-500
                   text-gray-800 dark:text-gray-100
                   font-semibold py-2 px-4 rounded
                   transition"
        >
            Avbryt
        </button>

    </div>

    </form>
</template>

<script>
import { ref, watch, computed } from "vue";

export default {

    props: {
        module: Object,
        onSubmit: Function,
        onCancel: Function,
        projects: {
            type: Array,
            default: () => []
        }
        
    },

    setup(props) {

        const form = ref({
            name: "",
            description: "",
            projectId: ""
        });

        watch(
            () => props.module,
            (mod) => {
                if (mod) {
                    form.value = {
                        ...mod,
                        projectId: mod.projectId != null ? Number(mod.projectId) : ""
                    };
                } else {
                    form.value = { name: "", description: "", projectId: "" };
                }
            },
            { immediate: true }
        );

        const isEditing = computed(() => !!props.module);

        const handleSubmit = () => {
            if (!form.value.name || !form.value.description || !form.value.projectId) return;

            props.onSubmit({
                name: form.value.name,
                description: form.value.description,
                projectId: Number(form.value.projectId)
            });
        };

        return {
            form,
            handleSubmit,
            isEditing
        };
    }
};
</script>