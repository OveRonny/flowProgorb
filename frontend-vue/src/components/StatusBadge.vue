<template>
  <div
    class="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit"
    :class="badgeClass"
  >
    ⏱ {{ label }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: String
})

const label = computed(() => {
  switch (props.status) {
    case 'ACTIVE': return 'Aktiv'
    case 'COMPLETED': return 'Fullført'
    case 'ON_HOLD': return 'På vent'
    default: return 'Planlagt'
  }
})

const badgeClass = computed(() => {
  switch (props.status) {
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-600'
    case 'COMPLETED':
      return 'bg-green-100 text-green-600'
    case 'ON_HOLD':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-200 text-gray-600'
  }
})
</script>