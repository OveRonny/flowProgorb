<template>
    <div class="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
        <form @submit.prevent="handleRegister" class="space-y-4">
            <input v-model="email" type="email" placeholder="Email" required
                class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input v-model="password" type="password" placeholder="Password" required
                class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button :disabled="loading"
                class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-50">
                Register
            </button>
            <p v-if="error" style="color:red">{{ error }}</p>
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

function handleRegister() {
    emit("submit", {
        email: email.value,
        password: password.value
    })
}
</script>