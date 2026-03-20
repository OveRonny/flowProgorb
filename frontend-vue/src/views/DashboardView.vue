<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">Overview of your projects, planning, and development</p>
      </div>

      <!-- Stats Bar -->
      <div v-if="currentProject" class="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <div class="grid gap-4 md:grid-cols-5">
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Milestones</p>
            <p class="text-2xl font-bold">{{ milestoneStats.total }}</p>
            <p class="text-xs opacity-75">{{ milestoneStats.completed }} completed</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Features</p>
            <p class="text-2xl font-bold">{{ featureStats.total }}</p>
            <p class="text-xs opacity-75">{{ featureStats.inProgress }} in progress</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Tasks</p>
            <p class="text-2xl font-bold">{{ taskStats.total }}</p>
            <p class="text-xs opacity-75">{{ taskStats.completed }} done</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Requirements</p>
            <p class="text-2xl font-bold">{{ requirementStats.total }}</p>
            <p class="text-xs opacity-75">{{ requirementStats.approved }} approved</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Meetings</p>
            <p class="text-2xl font-bold">{{ meetingStats }}</p>
            <p class="text-xs opacity-75">Scheduled</p>
          </div>
        </div>
      </div>

      <!-- Project Selector -->
      <div v-if="projects.length > 0" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Project</label>
        <select
          v-model="selectedProjectId"
          class="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option :value="null">-- All Projects --</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Planning Section -->
        <section class="space-y-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">1</span>
            Kundemøter & Idéer
          </h2>

          <div class="grid gap-4 md:grid-cols-2">
            <!-- Customer Meetings -->
            <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 class="mb-3 font-semibold text-gray-900 dark:text-gray-100">Kundemøter</h3>
              <div class="space-y-2">
                <div
                  v-for="meeting in recentMeetings"
                  :key="meeting.id"
                  class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-700"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ meeting.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(meeting.date) }}</p>
                  </div>
                  <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ meeting.attendees?.length || 0 }} attendes</span>
                </div>
                <p v-if="recentMeetings.length === 0" class="text-sm text-gray-500 dark:text-gray-400">Ingen møter planlagt</p>
              </div>
            </div>

            <!-- Requirements by Status -->
            <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 class="mb-3 font-semibold text-gray-900 dark:text-gray-100">Idéer & Krav</h3>
              <div class="space-y-2">
                <div v-for="status in ['OPEN', 'APPROVED', 'REJECTED']" :key="status" class="flex items-center justify-between">
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ statusLabel(status) }}</span>
                  <span :class="[
                    'inline-block rounded-full px-3 py-1 text-xs font-bold',
                    status === 'OPEN' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 
                    status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  ]">
                    {{ requirementsByStatus(status).length }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Roadmap & Milestones -->
        <section class="space-y-4">
          <h2 class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span>
            Roadmap & Milepæler
          </h2>

          <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div class="space-y-4">
              <div
                v-for="milestone in upcomingMilestones"
                :key="milestone.id"
                class="space-y-2 border-b border-gray-100 pb-3 last:border-b-0 dark:border-gray-700"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-900 dark:text-gray-100">{{ milestone.title }}</h4>
                  <span :class="[
                    'rounded-full px-2 py-1 text-xs font-semibold',
                    milestone.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  ]">
                    {{ milestone.completed ? '✓ Done' : '◯ Open' }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Due: {{ formatDate(milestone.dueDate) }}</p>
                <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div class="h-2 rounded-full bg-blue-500" :style="{ width: '75%' }"></div>
                </div>
              </div>
              <p v-if="upcomingMilestones.length === 0" class="text-sm text-gray-500 dark:text-gray-400">Ingen milepæler planlagt</p>
            </div>
          </div>
        </section>

        <!-- Development Board -->
        <section class="space-y-4 lg:col-span-2">
          <h2 class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">3</span>
            Utviklingsboard
          </h2>

          <div class="grid gap-4 md:grid-cols-3">
            <div
              v-for="status in ['PENDING', 'IN_PROGRESS', 'DONE']"
              :key="status"
              class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 class="mb-3 flex items-center justify-between font-semibold text-gray-900 dark:text-gray-100">
                {{ taskStatusLabel(status) }}
                <span class="rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {{ tasksByStatus(status).length }}
                </span>
              </h3>
              <div class="space-y-2">
                <div
                  v-for="task in tasksByStatus(status).slice(0, 3)"
                  :key="task.id"
                  class="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700"
                >
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ task.title }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ task.feature?.name }}</p>
                </div>
                <p v-if="tasksByStatus(status).length === 0" class="text-sm text-gray-500 dark:text-gray-400">Tom</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Project Overview & Recent Activity -->
        <section class="space-y-4 lg:col-span-2">
          <h2 class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">4</span>
            Projekstoversikt
          </h2>

          <div class="grid gap-4 md:grid-cols-2">
            <!-- Projects List -->
            <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 class="mb-3 font-semibold text-gray-900 dark:text-gray-100">Aktive Prosjekter</h3>
              <div class="space-y-3">
                <router-link
                  v-for="project in projects.slice(0, 5)"
                  :key="project.id"
                  :to="{ name: 'Features', params: { id: project.id } }"
                  class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ project.name }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ (project.features || []).length }} features</p>
                  </div>
                  <span :class="[
                    'rounded-full px-2 py-1 text-xs font-semibold',
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    project.status === 'PLANNED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  ]">
                    {{ project.status }}
                  </span>
                </router-link>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 class="mb-3 font-semibold text-gray-900 dark:text-gray-100">Nylig Aktivitet</h3>
              <div class="space-y-2">
                <div v-for="activity in recentActivity" :key="activity.id" class="flex gap-3 border-b border-gray-100 pb-2 last:border-b-0 dark:border-gray-700">
                  <div class="text-lg">{{ activityIcon(activity.type) }}</div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ activity.description }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatRelativeTime(activity.createdAt) }}</p>
                  </div>
                </div>
                <p v-if="recentActivity.length === 0" class="text-sm text-gray-500 dark:text-gray-400">Ingen nylig aktivitet</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '../features/projects/store.js'

const projectStore = useProjectsStore()
const selectedProjectId = ref(null)

const projects = computed(() => projectStore.projects || [])

const currentProject = computed(() => {
  if (!selectedProjectId.value) return null
  return projects.value.find((p) => p.id === selectedProjectId.value)
})

const allMeetings = computed(() => {
  if (currentProject.value?.customerMeetings) {
    return currentProject.value.customerMeetings
  }
  return projects.value.flatMap((p) => p.customerMeetings || [])
})

const recentMeetings = computed(() => {
  return allMeetings.value.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
})

const allRequirements = computed(() => {
  if (currentProject.value?.requirements) {
    return currentProject.value.requirements
  }
  return projects.value.flatMap((p) => p.requirements || [])
})

const requirementsByStatus = (status) => {
  return allRequirements.value.filter((r) => r.status === status)
}

const requirementStats = computed(() => ({
  total: allRequirements.value.length,
  approved: allRequirements.value.filter((r) => r.status === 'APPROVED').length,
  open: allRequirements.value.filter((r) => r.status === 'OPEN').length
}))

const allMilestones = computed(() => {
  if (currentProject.value?.milestones) {
    return currentProject.value.milestones
  }
  return projects.value.flatMap((p) => p.milestones || [])
})

const upcomingMilestones = computed(() => {
  return allMilestones.value.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4)
})

const milestoneStats = computed(() => ({
  total: allMilestones.value.length,
  completed: allMilestones.value.filter((m) => m.completed).length
}))

const allFeatures = computed(() => {
  if (currentProject.value?.features) {
    return currentProject.value.features
  }
  return projects.value.flatMap((p) => p.features || [])
})

const featureStats = computed(() => ({
  total: allFeatures.value.length,
  inProgress: allFeatures.value.filter((f) => f.status === 'IN_PROGRESS').length
}))

const allTasks = computed(() => {
  return allFeatures.value.flatMap((f) => f.tasks || [])
})

const tasksByStatus = (status) => {
  return allTasks.value.filter((t) => t.status === status)
}

const taskStats = computed(() => ({
  total: allTasks.value.length,
  completed: allTasks.value.filter((t) => t.status === 'DONE').length
}))

const meetingStats = computed(() => allMeetings.value.length)

const recentActivity = computed(() => {
  const activities = projects.value
    .flatMap((p) => (p.activities || []).map((a) => ({ ...a, projectName: p.name })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
  
  return activities.map((a) => ({
    ...a,
    description: getActivityDescription(a)
  }))
})

function getActivityDescription(activity) {
  const typeMap = {
    TASK_CREATED: 'Task created',
    TASK_COMPLETED: 'Task completed',
    FEATURE_CREATED: 'Feature created',
    FEATURE_COMPLETED: 'Feature completed',
    REQUIREMENT_CREATED: 'Requirement created',
    REQUIREMENT_APPROVED: 'Requirement approved',
    MILESTONE_COMPLETED: 'Milestone completed',
    CUSTOMER_MEETING_LOGGED: 'Meeting logged',
    PROJECT_UPDATED: 'Project updated'
  }
  return typeMap[activity.type] || activity.type
}

function activityIcon(type) {
  const iconMap = {
    TASK_CREATED: '✓',
    TASK_COMPLETED: '✅',
    FEATURE_CREATED: '⭐',
    FEATURE_COMPLETED: '🎉',
    REQUIREMENT_CREATED: '📋',
    REQUIREMENT_APPROVED: '👍',
    MILESTONE_COMPLETED: '🏁',
    CUSTOMER_MEETING_LOGGED: '📞',
    PROJECT_UPDATED: '🔄'
  }
  return iconMap[type] || '•'
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('no-NO', { month: 'short', day: 'numeric' })
}

function formatRelativeTime(date) {
  if (!date) return 'now'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString('no-NO')
}

function statusLabel(status) {
  const labels = {
    OPEN: 'Open',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  }
  return labels[status] || status
}

function taskStatusLabel(status) {
  const labels = {
    PENDING: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done'
  }
  return labels[status] || status
}

onMounted(async () => {
  await projectStore.fetchProjects()
})
</script>
