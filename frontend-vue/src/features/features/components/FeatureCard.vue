<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-gray-900 dark:text-gray-100">{{ feature.name }}</h3>
      <span class="text-gray-500 dark:text-gray-400">{{ feature.status }}</span>
    </div>
    <p class="text-gray-600 dark:text-gray-400">{{ feature.description || 'Ingen beskrivelse' }}</p>

   
    <div class="mt-2 flex flex-wrap gap-2">
      <span v-for="tech in feature.technologies" :key="tech.id" class="px-2 py-1 rounded-full text-sm"
        :class="techTypeClass(tech.type)">
        {{ tech.name }}
      </span>
    </div>
   
    <!-- <ul class="mt-2 space-y-1">
      <TaskCard v-for="task in feature.tasks" :key="task.id" :task="task" />
    </ul> -->
  </div>
</template>

<script setup>
/* import TaskCard from '../../tasks/components/TaskCard.vue' */

defineProps({
  feature: Object
})

const techTypeClass = (type) => {
  switch(type){
    case 'LANGUAGE': return 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200'
    case 'FRAMEWORK': return 'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200'
    case 'LIBRARY': return 'bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200'
    default: return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}
</script>