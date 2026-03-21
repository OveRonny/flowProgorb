<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <h1>Registrer</h1>
    <RegisterForm
      :loading="useStore.loading"
      :error="useStore.error"
      @submit="handleRegister"
    />
  </div>
</template>

<script setup>
import RegisterForm from "../components/RegisterForm.vue"

import { useRouter } from "vue-router"
import { useAuthStore } from "../store"

const router = useRouter()
const useStore = useAuthStore()

async function handleRegister(credentials) {
  try {
    await useStore.register(credentials) 

    if (useStore.token) {
      router.push("/") 
    }

  } catch (err) {
    console.error("Registration failed:", err)
  }
}
</script>