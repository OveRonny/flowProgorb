<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Tasks for {{ featureName }}</h1>
      <button
        @click="openModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Task
      </button>
    </div>

    <ul class="space-y-2" v-if="tasks.length">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <div class="flex justify-between">
          <span>{{ task.title }}</span>
          <span :class="task.status === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'">
            {{ task.status }}
          </span>
        </div>
        <p v-if="task.description" class="text-gray-500 dark:text-gray-300 mt-1">{{ task.description }}</p>
      </li>
    </ul>

    <div v-else class="text-gray-500">Ingen tasks funnet.</div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Add New Task</h2>

        <form @submit.prevent="submitTask">
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-200 mb-1">Title</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-200 mb-1">Description</label>
            <textarea
              v-model="form.description"
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-2">
            <button
              type="button"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectsStore } from '../../projects/store.js';

const route = useRoute();
const projectsStore = useProjectsStore();

const featureId = computed(() => Number(route.params.featureId));
const projectId = computed(() => Number(route.params.projectId));

const tasks = computed(() => projectsStore.tasks[featureId.value] ?? []);
const featureName = computed(() => {
  const feature = projectsStore.project?.features?.find(f => f.id === featureId.value);
  return feature?.name ?? 'Feature';
});

// Modal
const isModalOpen = ref(false);
const form = reactive({
  title: '',
  description: ''
});

const openModal = () => {
  form.title = '';
  form.description = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// Submit task
const submitTask = async () => {
  if (!form.title) return;

  try {
    await projectsStore.createTaskForFeature(featureId.value, {
      title: form.title,
      description: form.description
    });

    closeModal();
  } catch (err) {
    console.error('Failed to create task:', err);
  }
};

// Watch for route changes
watch([projectId, featureId], async ([nextProjectId, nextFeatureId]) => {
  if (!Number.isFinite(nextProjectId) || !Number.isFinite(nextFeatureId)) return;

  if (!projectsStore.project || projectsStore.project.id !== nextProjectId) {
    await projectsStore.fetchProjectById(nextProjectId);
  }

  if (!Object.prototype.hasOwnProperty.call(projectsStore.tasks, nextFeatureId)) {
    await projectsStore.fetchTasksForFeature(nextFeatureId);
  }
}, { immediate: true });
</script>