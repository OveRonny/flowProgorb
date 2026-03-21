<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div class="max-w-6xl mx-auto space-y-6">

            <div class="flex items-center justify-between gap-3">
                <button
                    v-if="featuresPath"
                    @click="goToFeatures"
                    class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    Tilbake til features
                </button>
            </div>

            <!-- Feature info -->
            <div class="bg-white dark:bg-gray-800 p-5 rounded shadow">
                <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {{ feature?.name }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ feature?.description }}
                </p>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div class="rounded-md bg-gray-100 dark:bg-gray-700/60 px-3 py-2">
                        <p class="text-gray-500 dark:text-gray-400">Total estimert</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ totalEstimatedHours }} timer</p>
                    </div>
                    <div class="rounded-md bg-gray-100 dark:bg-gray-700/60 px-3 py-2">
                        <p class="text-gray-500 dark:text-gray-400">Total logget</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ totalLoggedHours }} timer</p>
                    </div>
                    <div class="rounded-md px-3 py-2" :class="totalVarianceMinutes > 0
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-green-50 dark:bg-green-900/20'">
                        <p class="text-gray-500 dark:text-gray-400">{{ totalVarianceLabel }}</p>
                        <p class="font-semibold" :class="totalVarianceMinutes > 0
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-green-700 dark:text-green-300'">
                            {{ totalVarianceHours }} timer
                        </p>
                    </div>
                </div>
                <div class="mt-4 text-sm">
                    <p class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tid per task</p>
                    <div v-if="taskTimeSummaries.length" class="space-y-2">
                        <div v-for="item in taskTimeSummaries" :key="item.id"
                            class="rounded-md bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 px-3 py-2">
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ item.title }}</p>
                            <div class="mt-1 grid grid-cols-1 md:grid-cols-3 gap-1 text-xs">
                                <p class="text-gray-600 dark:text-gray-300">Estimert: <span class="font-semibold">{{ item.estimatedHours }}t</span></p>
                                <p class="text-gray-600 dark:text-gray-300">Logget: <span class="font-semibold">{{ item.loggedHours }}t</span></p>
                                <p :class="item.isOver
                                    ? 'text-red-700 dark:text-red-300'
                                    : 'text-green-700 dark:text-green-300'">
                                    {{ item.varianceLabel }}: <span class="font-semibold">{{ item.varianceHours }}t</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-gray-500 dark:text-gray-400">Ingen tidslogger enda.</p>
                </div>
            </div>

            <!-- Add task -->
            <button class="bg-blue-500 text-white px-4 py-2 rounded" @click="showModal = true">
                Ny oppgave
            </button>

            <!-- Kanban board -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- To do -->
                <div>
                    <h2 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Å gjøre
                    </h2>

                    <TaskCard v-for="task in pendingTasks" :key="task.id" :task="task" @updateStatus="updateStatus"
                        @addTimeLog="addTimeLog" @updateTimeLog="updateTimeLog" @deleteTimeLog="deleteTimeLog" @deleteTask="deleteTask" />
                </div>

                <!-- In Progress -->
                <div>
                    <h2 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Under arbeid
                    </h2>

                    <TaskCard v-for="task in inProgressTasks" :key="task.id" :task="task" @updateStatus="updateStatus"
                        @addTimeLog="addTimeLog" @updateTimeLog="updateTimeLog" @deleteTimeLog="deleteTimeLog" @deleteTask="deleteTask" />
                </div>

                <!-- Done -->
                <div>
                    <h2 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Ferdig
                    </h2>

                    <TaskCard v-for="task in doneTasks" :key="task.id" :task="task" @updateStatus="updateStatus"
                        @addTimeLog="addTimeLog" @updateTimeLog="updateTimeLog" @deleteTimeLog="deleteTimeLog" @deleteTask="deleteTask" />
                </div>

            </div>

            <!-- Modal -->
            <Modal v-model="showModal" title="Ny oppgave">
                <TaskForm @submit="createTask" />
            </Modal>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasksStore } from '../store'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '../components/TaskForm.vue'
import Modal from '@/components/Modal.vue'
import { useProjectsStore } from '../../projects/store.js'

const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()

const featureId = Number(route.params.featureId)
const projectStore = useProjectsStore()

const showModal = ref(false)
const webhookRefreshMs = 8000
let refreshIntervalId = null

const tasks = computed(() => tasksStore.tasks)
const feature = computed(() => tasks.value[0]?.feature ?? null)
const featuresPath = computed(() => {
    const projectId = Number(route.query.projectId || feature.value?.projectId)
    return Number.isInteger(projectId) && projectId > 0 ? `/project/${projectId}` : ''
})

const totalEstimatedMinutes = computed(() =>
    tasks.value.reduce((sum, task) => sum + ((Number(task.estimatedHours) || 0) * 60), 0)
)
const totalLoggedMinutes = computed(() =>
    tasks.value.reduce((taskSum, task) => {
        const taskMinutes = (task.timeLogs ?? []).reduce((logSum, log) => logSum + (Number(log.minutes) || 0), 0)
        return taskSum + taskMinutes
    }, 0)
)
const totalEstimatedHours = computed(() => (totalEstimatedMinutes.value / 60).toFixed(2))
const totalLoggedHours = computed(() => (totalLoggedMinutes.value / 60).toFixed(2))
const totalVarianceMinutes = computed(() => totalLoggedMinutes.value - totalEstimatedMinutes.value)
const totalVarianceHours = computed(() => (Math.abs(totalVarianceMinutes.value) / 60).toFixed(2))
const totalVarianceLabel = computed(() => (totalVarianceMinutes.value > 0 ? 'Over estimat' : 'Gjenstar'))

const taskTimeSummaries = computed(() =>
    tasks.value.map((task) => {
        const loggedMinutes = (task.timeLogs ?? []).reduce((sum, log) => sum + (Number(log.minutes) || 0), 0)
        const estimatedMinutes = (Number(task.estimatedHours) || 0) * 60
        const varianceMinutes = loggedMinutes - estimatedMinutes

        return {
            id: task.id,
            title: task.title,
            estimatedHours: (estimatedMinutes / 60).toFixed(2),
            loggedHours: (loggedMinutes / 60).toFixed(2),
            varianceHours: (Math.abs(varianceMinutes) / 60).toFixed(2),
            varianceLabel: varianceMinutes > 0 ? 'Over estimat' : 'Gjenstar',
            isOver: varianceMinutes > 0
        }
    })
)

const pendingTasks = computed(() =>
    tasks.value.filter(t => t.status === 'PENDING')
)

const inProgressTasks = computed(() =>
    tasks.value.filter(t => t.status === 'IN_PROGRESS')
)

const doneTasks = computed(() =>
    tasks.value.filter(t => t.status === 'DONE')
)

onMounted(async () => {
    const featureId = Number(route.params.featureId)
    if (!featureId) return
    await tasksStore.fetchTasks(featureId)

    // Poll periodically so GitHub webhook updates are reflected without manual reload.
    refreshIntervalId = setInterval(async () => {
        try {
            await tasksStore.fetchTasks(featureId)
        } catch {
            // Ignore transient fetch errors; next poll will retry.
        }
    }, webhookRefreshMs)
})

onUnmounted(() => {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId)
        refreshIntervalId = null
    }
})

watch(
    () => route.query.create,
    () => {
        if (String(route.query.create || '').toLowerCase() === 'task') {
            showModal.value = true
        }
    },
    { immediate: true }
)

const goToFeatures = () => {
    if (!featuresPath.value) return
    router.push(featuresPath.value)
}

const createTask = async (task) => {
    await tasksStore.createTask(featureId, task)
    showModal.value = false
        const projectId = Number(route.query.projectId || feature.value?.projectId)
        if (projectId > 0) {
            await projectStore.fetchProjectById(projectId)
        }
}

const updateStatus = async (task, status) => {
    await tasksStore.updateTask(featureId, task.id, { status })
        const projectId = Number(route.query.projectId || feature.value?.projectId)
        if (projectId > 0) {
            await projectStore.fetchProjectById(projectId)
        }
}

const addTimeLog = async (task, payload) => {
    await tasksStore.createTaskTimeLog(featureId, task.id, payload)
}

const updateTimeLog = async (task, timeLogId, payload) => {
    await tasksStore.updateTaskTimeLog(featureId, task.id, timeLogId, payload)
}

const deleteTimeLog = async (task, timeLogId) => {
    await tasksStore.deleteTaskTimeLog(featureId, task.id, timeLogId)
}

const deleteTask = async (task) => {
    if (!task?.id) {
        return
    }

    const confirmed = window.confirm(`Slette oppgaven "${task.title}"?`)
    if (!confirmed) {
        return
    }

    await tasksStore.deleteTask(featureId, task.id)

    const projectId = Number(route.query.projectId || feature.value?.projectId)
    if (projectId > 0) {
        await projectStore.fetchProjectById(projectId)
    }
}
</script>
