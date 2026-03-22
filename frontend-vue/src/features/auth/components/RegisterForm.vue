<template>
    <div class="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
        <form @submit.prevent="handleRegister" class="space-y-4">
            <input v-model="email" type="email" placeholder="E-post" required
                class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <input v-model="password" type="password" placeholder="Passord" required
                class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <input v-model="confirmPassword" type="password" placeholder="Bekreft passord" required
                class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button :disabled="loading"
                class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-50">
                Registrer
            </button>

            <p v-if="error" class="text-red-500">{{ error }}</p>
            <p v-if="passwordMismatch" class="text-red-500">Passordene er ikke like</p>
        </form>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/store.js'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref(null)
const loading = ref(false)

const passwordMismatch = computed(() => password.value && confirmPassword.value && password.value !== confirmPassword.value)

function getRedirectTarget() {
    const redirect = route.query.redirect
    return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
}

const handleRegister = async () => {
    error.value = null

    if (passwordMismatch.value) {
        return
    }

    loading.value = true
    try {
        const success = await auth.register({ email: email.value, password: password.value })

        if (success !== false && auth.token) {
            router.push(getRedirectTarget())
        }

    } catch (err) {
        error.value = err
    } finally {
        loading.value = false
    }
}
</script>