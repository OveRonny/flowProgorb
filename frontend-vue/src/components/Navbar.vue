<template>
  <nav class="bg-gray-800 text-white p-4 dark:bg-slate-950">
    <div class="container mx-auto flex items-center justify-between">
      <div class="text-lg font-bold">FlowProgorb</div>

   
      <ul class="flex space-x-6">
        <li><router-link to="/" class="hover:underline">Dashbord</router-link></li>
        <li><router-link to="/project" class="hover:underline">Projects</router-link></li>
      </ul>

      
      <div class="flex items-center space-x-4">     
        <template v-if="!auth.token">
          <router-link to="/login" class="hover:underline">Login</router-link>
          <router-link to="/register" class="hover:underline">Register</router-link>
        </template>

       
        <template v-else>
          <span class="mr-2">Hi, {{ auth.user?.name || auth.email }}</span>
          <button @click="auth.logout" class="hover:underline">Logout</button>
        </template>
        <button
          @click="$emit('toggle-theme')"
          class="p-2 rounded hover:bg-white/10 transition"
          :title="isDark ? 'Light mode' : 'Dark mode'"
        >
          <component :is="isDark ? SunIcon : MoonIcon" class="w-5 h-5" />
        </button>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../features/auth/store.js'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

const auth = useAuthStore()
defineProps({
  isDark: Boolean
})
defineEmits(['toggle-theme'])
</script>