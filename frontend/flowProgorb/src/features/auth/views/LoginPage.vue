<template>
   <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <LoginForm @submit="handleLogin" />
    </div> 
</template>

<script setup>
import LoginForm from "../components/LoginForm.vue"

import { useRouter } from "vue-router"
import { useAuthStore } from "../store"

const router = useRouter()
const useStore = useAuthStore()

async function handleLogin(credentials) {
  try {
    await useStore.login(credentials) 

    if (useStore.token) {
      router.push("/") 
    }

  } catch (err) {
    console.error("Login failed:", err)
  }
}
</script>