<template>
  <div class="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
    <h2 class="text-2xl font-bold text-white text-center mb-6">
      Logg inn
    </h2>

    <form @submit.prevent="handleLogin" class="space-y-4">

      <input v-model="email" type="email" placeholder="E-post" required
        class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <input v-model="password" type="password" placeholder="Passord" required
        class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <button type="submit" :disabled="loading"
        class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-50">
        {{ loading ? "Logger inn..." : "Logg inn" }}
      </button>

      <p v-if="error" class="text-red-500 text-sm text-center">
        {{ error }}
      </p>

    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"

defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
})

const emit = defineEmits(["submit"])

const email = ref("")
const password = ref("")

function handleLogin() {
  emit("submit", {
    email: email.value,
    password: password.value
  })
}
</script>