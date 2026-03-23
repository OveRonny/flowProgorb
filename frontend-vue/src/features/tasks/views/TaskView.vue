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
                <div class="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/40">
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">Timepris for prosjekt</p>
                    <p v-if="projectHourlyRate" class="mt-2 text-xs text-gray-600 dark:text-gray-300">Aktiv timepris: {{ formatCurrency(projectHourlyRate) }} / time</p>
                    <p v-else class="mt-2 text-xs text-amber-700 dark:text-amber-300">Sett timepris på prosjektet for å følge prosjektkostnad fra tidslogging.</p>
                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Timepris administreres på prosjektsiden, ikke på funksjonen eller oppgaven.</p>
                </div>
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
                <div v-if="projectHourlyRate" class="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                    <div class="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 dark:border-indigo-900/40 dark:bg-indigo-900/20">
                        <p class="text-gray-500 dark:text-gray-400">Estimert kostnad</p>
                        <p class="font-semibold text-indigo-800 dark:text-indigo-200">{{ formatCurrency(estimatedCost) }}</p>
                    </div>
                    <div class="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                        <p class="text-gray-500 dark:text-gray-400">Logget kostnad</p>
                        <p class="font-semibold text-emerald-800 dark:text-emerald-200">{{ formatCurrency(loggedCost) }}</p>
                    </div>
                    <div class="rounded-md border px-3 py-2" :class="costVariance >= 0 ? 'border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20' : 'border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20'">
                        <p class="text-gray-500 dark:text-gray-400">Kostnadsavvik</p>
                        <p class="font-semibold" :class="costVariance >= 0 ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'">{{ formatCurrency(Math.abs(costVariance)) }}</p>
                    </div>
                </div>
                <div class="mt-4 text-sm">
                    <p class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tid per task</p>
                    <div v-if="taskTimeSummaries.length" class="space-y-2">
                        <div v-for="item in taskTimeSummaries" :key="item.id"
                            class="rounded-md bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 px-3 py-2">
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ item.title }}</p>
                            <div class="mt-1 grid grid-cols-1 md:grid-cols-3 gap-1 text-xs">
                                <p class="text-gray-600 dark:text-gray-300">Estimert: <span class="font-semibold">{{ item.estimatedHours }} t</span></p>
                                <p class="text-gray-600 dark:text-gray-300">Logget: <span class="font-semibold">{{ item.loggedHours }} t</span></p>
                                <p :class="item.isOver
                                    ? 'text-red-700 dark:text-red-300'
                                    : 'text-green-700 dark:text-green-300'">
                                    {{ item.varianceLabel }}: <span class="font-semibold">{{ item.varianceHours }} t</span>
                                </p>
                            </div>
                            <div v-if="projectHourlyRate" class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-1 text-xs">
                                <p class="text-indigo-700 dark:text-indigo-300">Estimert pris: <span class="font-semibold">{{ formatCurrency(item.estimatedCost) }}</span></p>
                                <p class="text-emerald-700 dark:text-emerald-300">Logget pris: <span class="font-semibold">{{ formatCurrency(item.loggedCost) }}</span></p>
                                <p :class="item.costVariance >= 0
                                    ? 'text-red-700 dark:text-red-300'
                                    : 'text-amber-700 dark:text-amber-300'">
                                    Avvik pris: <span class="font-semibold">{{ formatCurrency(Math.abs(item.costVariance)) }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-gray-500 dark:text-gray-400">Ingen tidslogger enda.</p>
                </div>

                <p v-if="tasksStore.error" class="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                    {{ tasksStore.error }}
                </p>
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

                    <TaskCard v-for="task in pendingTasks" :key="task.id" :task="task" :githubConnected="githubConnected" @updateStatus="updateStatus"
                        @addTimeLog="addTimeLog" @updateTimeLog="updateTimeLog" @deleteTimeLog="deleteTimeLog" @deleteTask="deleteTask" @createIssue="createIssue" @syncIssue="syncIssue" />
                </div>

                <!-- In Progress -->
                <div>
                    <h2 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Under arbeid
                    </h2>

                    <TaskCard v-for="task in inProgressTasks" :key="task.id" :task="task" :githubConnected="githubConnected" @updateStatus="updateStatus"
                        @addTimeLog="addTimeLog" @updateTimeLog="updateTimeLog" @deleteTimeLog="deleteTimeLog" @deleteTask="deleteTask" @createIssue="createIssue" @syncIssue="syncIssue" />
                </div>

                <!-- Done -->
                <div>
                    <h2 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Ferdig
                    </h2>

                    <TaskCard v-for="task in doneTasks" :key="task.id" :task="task" :githubConnected="githubConnected" @updateStatus="updateStatus"
                        @addTimeLog="addTimeLog" @updateTimeLog="updateTimeLog" @deleteTimeLog="deleteTimeLog" @deleteTask="deleteTask" @createIssue="createIssue" @syncIssue="syncIssue" />
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
import { confirmDialog } from '../../shared/confirmDialog.js'

const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()

const featureId = Number(route.params.featureId)
const projectStore = useProjectsStore()

const showModal = ref(false)
const webhookRefreshMs = 8000
let refreshIntervalId = null
const hoursFormatter = new Intl.NumberFormat('no-NO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
})

const tasks = computed(() => tasksStore.tasks)
const feature = computed(() => tasks.value[0]?.feature ?? null)
const githubConnected = computed(() => Boolean(projectStore.project?.githubOwner && projectStore.project?.githubRepoName))
const projectHourlyRate = computed(() => {
    const value = Number(projectStore.project?.hourlyRate)
    if (!Number.isFinite(value) || value <= 0) {
        return null
    }

    return value
})
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
const formatHours = (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return '0'
    }

    return hoursFormatter.format(parsed)
}
const totalEstimatedHours = computed(() => formatHours(totalEstimatedMinutes.value / 60))
const totalLoggedHours = computed(() => formatHours(totalLoggedMinutes.value / 60))
const totalVarianceMinutes = computed(() => totalLoggedMinutes.value - totalEstimatedMinutes.value)
const totalVarianceHours = computed(() => formatHours(Math.abs(totalVarianceMinutes.value) / 60))
const totalVarianceLabel = computed(() => (totalVarianceMinutes.value > 0 ? 'Over estimat' : 'Gjenstar'))
const estimatedCost = computed(() => ((projectHourlyRate.value || 0) * totalEstimatedMinutes.value) / 60)
const loggedCost = computed(() => ((projectHourlyRate.value || 0) * totalLoggedMinutes.value) / 60)
const costVariance = computed(() => loggedCost.value - estimatedCost.value)

const taskTimeSummaries = computed(() =>
    tasks.value.map((task) => {
        const loggedMinutes = (task.timeLogs ?? []).reduce((sum, log) => sum + (Number(log.minutes) || 0), 0)
        const estimatedMinutes = (Number(task.estimatedHours) || 0) * 60
        const varianceMinutes = loggedMinutes - estimatedMinutes
        const hourlyRate = projectHourlyRate.value || 0

        return {
            id: task.id,
            title: task.title,
            estimatedHours: formatHours(estimatedMinutes / 60),
            loggedHours: formatHours(loggedMinutes / 60),
            varianceHours: formatHours(Math.abs(varianceMinutes) / 60),
            varianceLabel: varianceMinutes > 0 ? 'Over estimat' : 'Gjenstar',
            isOver: varianceMinutes > 0,
            estimatedCost: (hourlyRate * estimatedMinutes) / 60,
            loggedCost: (hourlyRate * loggedMinutes) / 60,
            costVariance: ((hourlyRate * loggedMinutes) / 60) - ((hourlyRate * estimatedMinutes) / 60)
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

    const projectId = Number(route.query.projectId || feature.value?.projectId)
    if (projectId > 0) {
        await projectStore.fetchProjectById(projectId)
    }

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
    await tasksStore.fetchTasks(featureId)
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

const createIssue = async (task) => {
    const created = await tasksStore.createTaskGithubIssue(featureId, task.id, {
        title: task.title,
        body: task.description || ''
    })
    if (!created) {
        return
    }
}

const syncIssue = async (task) => {
    await tasksStore.syncTaskGithubIssue(featureId, task.id)
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

    const confirmed = await confirmDialog.open({
        title: 'Slett oppgave',
        message: `Slette oppgaven ${task.title}?`,
        details: 'Oppgaven og tilhørende innhold blir fjernet.',
        confirmText: 'Slett',
        tone: 'danger'
    })
    if (!confirmed) {
        return
    }

    await tasksStore.deleteTask(featureId, task.id)

    const projectId = Number(route.query.projectId || feature.value?.projectId)
    if (projectId > 0) {
        await projectStore.fetchProjectById(projectId)
    }
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('no-NO', {
        style: 'currency',
        currency: 'NOK',
        maximumFractionDigits: 0
    }).format(Number(value) || 0)
}
</script>
