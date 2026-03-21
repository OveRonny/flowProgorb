<template>
  <nav class="border-b border-gray-200 bg-white/95 px-4 py-3 text-gray-900 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-950/95 dark:text-white">
    <div class="container mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center justify-between gap-4">
        <router-link to="/" class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          FlowProgorb
        </router-link>

        <button
          @click="$emit('toggle-theme')"
          class="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-white/10 lg:hidden"
          :title="isDark ? 'Lys modus' : 'Mørk modus'"
        >
          <component :is="isDark ? SunIcon : MoonIcon" class="h-5 w-5" />
        </button>
      </div>

      <div class="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <router-link
            v-for="link in visibleLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-2 text-sm font-medium transition"
            :class="route.path === link.to
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'"
          >
            {{ link.label }}
          </router-link>

          <!-- Planning link -->
          <router-link
            v-if="auth.token && projectIdFromRoute"
            :to="{ name: 'ProjectPlanning', params: { id: projectIdFromRoute } }"
            class="rounded-lg px-3 py-2 text-sm font-medium transition"
            :class="route.name === 'ProjectPlanning'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'"
          >
            Prosjektplanlegging
          </router-link>
        </div>

        <div class="flex flex-wrap items-center gap-2 lg:justify-end">
          <template v-if="!auth.token">
            <router-link to="/login" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
              Logg inn
            </router-link>
            <router-link to="/register" class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Registrer
            </router-link>
          </template>

          <template v-else>
            <span class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              Hei, {{ auth.user?.name || auth.email }}
            </span>
            <button @click="auth.logout" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
              Logg ut
            </button>
          </template>

          <button
            @click="$emit('toggle-theme')"
            class="hidden rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-white/10 lg:inline-flex"
            :title="isDark ? 'Lys modus' : 'Mørk modus'"
          >
            <component :is="isDark ? SunIcon : MoonIcon" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../features/auth/store.js'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

const auth = useAuthStore()
const route = useRoute()

const props = defineProps({
  isDark: Boolean
})

defineEmits(['toggle-theme'])

const visibleLinks = computed(() => {
  const baseLinks = [
    { to: '/', label: 'Oversikt' }
  ]

  if (auth.token) {
    return [
      ...baseLinks,
      { to: '/development', label: 'Utvikling' },
      { to: '/planning-overview', label: 'Planlegging' },
      { to: '/module', label: 'Moduler' },
      { to: '/technology', label: 'Teknologier' }
    ]
  }

  return baseLinks
})

const projectIdFromRoute = computed(() => {
  const match = route.path.match(/\/project\/(\d+)/)
  return match ? match[1] : null
})
</script>
