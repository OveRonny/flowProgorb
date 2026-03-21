<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-950">
    <div class="text-center">
      <p v-if="error" class="text-red-400 text-lg">{{ error }}</p>
      <p v-else class="text-gray-400 text-lg">Logger deg inn med GitHub…</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'

const router = useRouter()
const auth = useAuthStore()
const error = ref(null)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const err = params.get('error')

  if (err) {
    error.value = decodeURIComponent(err)
    setTimeout(() => router.push('/login'), 3000)
    return
  }

  if (token) {
    auth.token = token
    localStorage.setItem('token', token)
    router.push('/')
  } else {
    error.value = 'Mottok ikke token'
    setTimeout(() => router.push('/login'), 3000)
  }
})
</script>
