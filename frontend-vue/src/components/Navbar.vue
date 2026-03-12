<template>
   <nav class="bg-gray-800 text-white p-4 dark:bg-slate-950">
    <div class="container mx-auto relative flex items-center justify-between">
      <div class="text-lg font-bold">FlowProgorb</div>
      <ul class="absolute left-1/2 flex -translate-x-1/2 items-center space-x-6">
        <li><router-link to="/" class="hover:underline">Dashbord</router-link></li>
        <li><router-link to="/projects" class="hover:underline">Projects</router-link></li>
      </ul>

      <button
        type="button"
        @click="emit('toggle-theme')"
        class="rounded border border-white/30 px-3 py-1 text-sm hover:bg-white/10"
      >
        {{ isDark ? 'Light mode' : 'Dark mode' }}
      </button>
    </div>
    </nav>
</template>

<script setup>
defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-theme'])
</script>