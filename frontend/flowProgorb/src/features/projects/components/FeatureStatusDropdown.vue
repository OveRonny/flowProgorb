<template>
    <div class="flex items-center gap-2">
        <label class="font-semibold text-gray-700 dark:text-gray-200">Status:</label>
        <select v-model="localStatus" @change="updateStatus"
            class="px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100">
            <option v-for="status in statuses" :key="status.value" :value="status.value">
                {{ status.label }}
            </option>
        </select>

        <span :class="{
            'text-green-500': localStatus === 'DONE',
            'text-blue-500': localStatus === 'ACTIVE',
            'text-gray-500': localStatus === 'COMPLETED',
            'text-gray-500': localStatus === 'ON_HOLD'

        }" class="ml-2 font-bold">
            {{ localStatus }}
        </span>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

// Props fra parent
const props = defineProps({
    featureId: { type: Number, required: true },
    status: { type: String, required: true } // PLANNED | IN_PROGRESS | DONE
})

// Enum-verdier for status
const statuses = [
    { value: 'PLANNED', label: 'Planlagt' },    
    { value: 'DONE', label: 'Ferdig' },
    { value: 'COMPLETED', label: 'Fullført' },
    { value: 'ON_HOLD', label: 'På vent' }
]

const localStatus = ref(props.status)

// Watch for prop-endring
watch(
    () => props.status,
    (newVal) => (localStatus.value = newVal)
)

// Funksjon for å oppdatere status i backend
const updateStatus = async () => {
    try {
        await axios.patch(`/api/features/${props.featureId}`, {
            status: localStatus.value
        })
        console.log('Status oppdatert:', localStatus.value)
    } catch (error) {
        console.error('Feil ved oppdatering:', error)
    }
}
</script>