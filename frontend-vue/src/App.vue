<template>
  <div class="min-h-screen flex flex-col bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors">
    <Navbar :isDark="isDark" @toggle-theme="toggleTheme" />
    <main class="flex-1">
      <router-view />
    </main>
    <ConfirmDialogHost />
    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ConfirmDialogHost from './components/ConfirmDialogHost.vue'

const isDark = ref(false)

const applyTheme = (darkEnabled) => {
  document.documentElement.classList.toggle('dark', darkEnabled)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme
    ? savedTheme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches

  applyTheme(isDark.value)
})
</script>
