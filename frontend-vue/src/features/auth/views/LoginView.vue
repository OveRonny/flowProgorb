<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <LoginForm @submit="handleLogin" />
  </div>
</template>

<script setup>
import LoginForm from "../components/LoginForm.vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "../../auth/store.js"  

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()  

function getRedirectTarget() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/project'
}

async function handleLogin(credentials) {
  const success = await auth.login(credentials)   

  if (success) {
    router.push(getRedirectTarget())
  } else {
    console.error("Login failed")
  }
}

</script>