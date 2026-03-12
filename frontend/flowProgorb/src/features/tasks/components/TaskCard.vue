<template>
  <li class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
    <span class="text-gray-900 dark:text-gray-100">{{ task.title }}</span>
    <span :class="statusClass(task.status)">{{ task.status }}</span>
  </li>
</template>

<script setup>
defineProps({
  task: Object
})

const statusClass = (status) => {
  switch(status){
    case 'COMPLETED': return 'text-green-700 dark:text-green-300 font-semibold'
    case 'PENDING': return 'text-yellow-700 dark:text-yellow-300 font-semibold'
    default: return 'text-gray-700 dark:text-gray-300'
  }
}
</script>