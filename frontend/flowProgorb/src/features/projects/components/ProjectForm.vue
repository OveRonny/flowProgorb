<template>
    <div class="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
        <h2 class="text-2xl font-bold text-white text-center mb-6">
            Nytt prosjekt
        </h2>

         <form @submit.prevent="handleSubmit" class="space-y-4">

      <input v-model="name" type="text" placeholder="Prosjekt navn" required
        class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <input v-model="description" type="text" placeholder="Beskrivelse" required
        class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <button type="submit" :disabled="loading"
        class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-50">
        {{ loading ? "Lagrer..." : "Lagre" }}
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

const name = ref("")
const description = ref("")

function handleSubmit() {
    emit("submit", {
        name: name.value,
        description: description.value
    })
}

</script>