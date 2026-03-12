<template>
    <form @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Add Technology</h2>

        <div class="mb-4">
            <label for="name" class="block text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input id="name" v-model="name" required
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>

        <div class="mb-4">
            <label for="type" class="block text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select id="type" v-model="type" required
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Velg type</option>
                <option v-for="t in types" :key="t.value" :value="t.value">
                    {{ (typeLabels && typeLabels[t.value]) || t.label || t.value }}
                </option>
            </select>
        </div>

        <button type="submit"
            class="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
            Save
        </button>
    </form>
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    types: { type: Array, default: () => [] },
    typeLabels: { type: Object, default: () => ({}) },
    onSubmit: Function
  },
  setup(props) {
    const name = ref("");
    const type = ref("");

    const handleSubmit = () => {
      if (!name.value || !type.value) return;
      if (props.onSubmit) props.onSubmit({ name: name.value, type: type.value });
      name.value = "";
      type.value = "";
    };

    return { name, type, handleSubmit, typeLabels: props.typeLabels };
  }
};
</script>