<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Oversikt</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">Oversikt over prosjekter, planlegging og utvikling</p>
      </div>

      <!-- Stats Bar -->
      <div v-if="currentProject" class="rounded-lg bg-linear-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <div class="grid gap-4 md:grid-cols-5">
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Milepæler</p>
            <p class="text-2xl font-bold">{{ milestoneStats.total }}</p>
            <p class="text-xs opacity-75">{{ milestoneStats.completed }} fullført</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Funksjoner</p>
            <p class="text-2xl font-bold">{{ featureStats.total }}</p>
            <p class="text-xs opacity-75">{{ featureStats.inProgress }} under arbeid</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Oppgaver</p>
            <p class="text-2xl font-bold">{{ taskStats.total }}</p>
            <p class="text-xs opacity-75">{{ taskStats.completed }} ferdig</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Krav</p>
            <p class="text-2xl font-bold">{{ requirementStats.total }}</p>
            <p class="text-xs opacity-75">{{ requirementStats.approved }} godkjent</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium opacity-90">Møter</p>
            <p class="text-2xl font-bold">{{ meetingStats }}</p>
            <p class="text-xs opacity-75">Planlagt</p>
          </div>
        </div>
      </div>

      <!-- Project Selector -->
      <div v-if="projects.length > 0" class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Velg prosjekt</label>
        <select
          v-model="selectedProjectId"
          class="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option :value="null">-- Alle prosjekter --</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Planning Section -->
        <section class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-1 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white">1</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Kundemøter og ideer</h2>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <!-- Customer Meetings -->
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">Kundemøter</h3>
                <router-link
                  v-if="targetProject"
                  :to="createLinks.meeting"
                  class="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  + Nytt
                </router-link>
              </div>
              <div class="space-y-2">
                <template v-for="meeting in recentMeetings" :key="meeting.id">
                  <router-link
                    v-if="meetingDetailLink(meeting)"
                    :to="meetingDetailLink(meeting)"
                    class="block rounded-lg border border-gray-100 bg-gray-50 p-2 transition hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-700 dark:hover:border-blue-800 dark:hover:bg-blue-900/20"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ meeting.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(meeting.date) }}</p>
                      </div>
                      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ meeting.attendees?.length || 0 }} deltakere</span>
                    </div>
                  </router-link>
                  <div
                    v-else
                    class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-700"
                  >
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ meeting.title }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(meeting.date) }}</p>
                    </div>
                    <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ meeting.attendees?.length || 0 }} deltakere</span>
                  </div>
                </template>
                <p v-if="recentMeetings.length === 0" class="text-sm text-gray-500 dark:text-gray-400">Ingen møter planlagt</p>
              </div>
            </div>

            <!-- Requirements by Status -->
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">Ideer & Krav</h3>
                <router-link
                  v-if="targetProject"
                  :to="createLinks.requirement"
                  class="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  + Nytt krav
                </router-link>
              </div>
              <div class="mb-3 grid grid-cols-3 rounded-lg bg-gray-200 p-1 text-xs font-semibold dark:bg-gray-700">
                <div class="rounded px-2 py-1 text-center text-gray-700 dark:text-gray-200">Åpen</div>
                <div class="rounded px-2 py-1 text-center text-gray-700 dark:text-gray-200">Godkjent</div>
                <div class="rounded px-2 py-1 text-center text-gray-700 dark:text-gray-200">Avvist</div>
              </div>
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
        <section class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-1 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white">2</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Roadmap & Milepaler</h2>
          </div>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <div class="mb-3 flex items-center justify-end">
              <router-link
                v-if="targetProject"
                :to="createLinks.milestone"
                class="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                + Ny milepæl
              </router-link>
            </div>
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
                    {{ milestone.completed ? '✓ Ferdig' : '◯ Åpen' }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Frist: {{ formatDate(milestone.dueDate) }}</p>
                <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    class="h-2 rounded-full"
                    :class="milestone.completed ? 'bg-green-500' : 'bg-blue-500'"
                    :style="{ width: `${milestoneProgressPercent(milestone)}%` }"
                  ></div>
                </div>
              </div>
              <p v-if="upcomingMilestones.length === 0" class="text-sm text-gray-500 dark:text-gray-400">Ingen milepæler planlagt</p>
            </div>
          </div>
        </section>

        <!-- Time Planning -->
        <section class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-1 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white">3</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Tidsplanlegging</h2>
          </div>

          <div class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Tidslogg</h3>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/40 dark:bg-blue-900/20">
                <p class="text-xs font-semibold text-blue-700 dark:text-blue-300">Estimert tid</p>
                <p class="mt-1 text-xl font-bold text-blue-800 dark:text-blue-200">{{ timePlanning.estimatedHours }} t</p>
              </div>
              <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Logget tid</p>
                <p class="mt-1 text-xl font-bold text-emerald-800 dark:text-emerald-200">{{ timePlanning.loggedHours }} t</p>
              </div>
              <div
                class="rounded-lg border p-3"
                :class="timePlanning.varianceMinutes > 0
                  ? 'border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20'
                  : 'border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20'"
              >
                <p class="text-xs font-semibold" :class="timePlanning.varianceMinutes > 0
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-700 dark:text-amber-300'">
                  {{ timePlanning.varianceMinutes > 0 ? 'Over estimat' : 'Gjenstår' }}
                </p>
                <p class="mt-1 text-xl font-bold" :class="timePlanning.varianceMinutes > 0
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-amber-800 dark:text-amber-200'">
                  {{ timePlanning.varianceHours }} t
                </p>
              </div>
            </div>

            <div class="space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div class="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span>Tidsbruk mot estimat</span>
                <span>{{ timePlanning.progressPercent }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="timePlanning.progressPercent >= 100 ? 'bg-red-500' : 'bg-blue-500'"
                  :style="{ width: `${timePlanning.progressPercent}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ timePlanning.overBudgetTasks }} oppgaver er over estimert tid</p>
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <h3 class="mb-3 font-semibold text-gray-900 dark:text-gray-100">Kommende frister</h3>
            <div class="space-y-2">
              <div
                v-for="milestone in deadlineMilestones"
                :key="milestone.id"
                class="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2 dark:border-gray-700 dark:bg-gray-700"
              >
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ milestone.title }}</p>
                <span
                  class="rounded-full px-2 py-1 text-xs font-semibold"
                  :class="milestoneDeadlineClass(daysUntil(milestone.dueDate))"
                >
                  {{ deadlineLabel(milestone.dueDate) }}
                </span>
              </div>
              <p v-if="deadlineMilestones.length === 0" class="text-sm text-gray-500 dark:text-gray-400">Ingen åpne milepæler med frist</p>
            </div>
          </div>
        </section>

        <!-- Hourly Pricing -->
        <section class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-1 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white">4</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Timepriser</h2>
          </div>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Prisoversikt</h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">Valgt prosjekt</span>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-md border border-sky-100 bg-sky-50 p-3 dark:border-sky-900/40 dark:bg-sky-900/20">
                <p class="text-xs font-semibold text-sky-700 dark:text-sky-300">Tilbudspris</p>
                <p class="mt-1 text-lg font-bold text-sky-800 dark:text-sky-200">{{ projectOfferPrice ? formatCurrency(projectOfferPrice) : 'Ikke satt' }}</p>
              </div>
              <div class="rounded-md border border-cyan-100 bg-cyan-50 p-3 dark:border-cyan-900/40 dark:bg-cyan-900/20">
                <p class="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Prosjektpris</p>
                <p class="mt-1 text-lg font-bold text-cyan-800 dark:text-cyan-200">{{ projectOfferPrice ? formatCurrency(projectOfferPrice) : 'Ikke satt' }}</p>
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">I dagens oppsett lagres tilbudspris og prosjektpris i samme prosjektfelt.</p>
          </div>

          <div v-if="projectHourlyRate" class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-md border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/40 dark:bg-blue-900/20">
              <p class="text-xs font-semibold text-blue-700 dark:text-blue-300">Timepris</p>
              <p class="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">{{ formatCurrency(projectHourlyRate) }}</p>
            </div>
            <div class="rounded-md border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/40 dark:bg-indigo-900/20">
              <p class="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Estimert kostnad</p>
              <p class="mt-1 text-lg font-bold text-indigo-800 dark:text-indigo-200">{{ formatCurrency(timePlanning.estimatedCost) }}</p>
            </div>
            <div class="rounded-md border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
              <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Logget kostnad</p>
              <p class="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-200">{{ formatCurrency(timePlanning.loggedCost) }}</p>
            </div>
            <div class="rounded-md border p-3" :class="timePlanning.costVariance >= 0
              ? 'border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20'
              : 'border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20'">
              <p class="text-xs font-semibold" :class="timePlanning.costVariance >= 0
                ? 'text-red-700 dark:text-red-300'
                : 'text-amber-700 dark:text-amber-300'">
                {{ timePlanning.costVariance >= 0 ? 'Kostnad over estimat' : 'Kostnad gjenstår' }}
              </p>
              <p class="mt-1 text-lg font-bold" :class="timePlanning.costVariance >= 0
                ? 'text-red-800 dark:text-red-200'
                : 'text-amber-800 dark:text-amber-200'">
                {{ formatCurrency(Math.abs(timePlanning.costVariance)) }}
              </p>
            </div>

            <template v-if="projectOfferPrice">
              <div class="rounded-md border border-sky-100 bg-sky-50 p-3 dark:border-sky-900/40 dark:bg-sky-900/20">
                <p class="text-xs font-semibold text-sky-700 dark:text-sky-300">Prosjektpris</p>
                <p class="mt-1 text-lg font-bold text-sky-800 dark:text-sky-200">{{ formatCurrency(projectOfferPrice) }}</p>
              </div>
              <div class="rounded-md border border-cyan-100 bg-cyan-50 p-3 dark:border-cyan-900/40 dark:bg-cyan-900/20">
                <p class="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Brukt av prosjektpris</p>
                <p class="mt-1 text-lg font-bold text-cyan-800 dark:text-cyan-200">{{ offerUsage.usedPercent.toFixed(1) }}%</p>
                <p class="mt-1 text-xs text-cyan-700/80 dark:text-cyan-300/80">{{ formatCurrency(offerUsage.usedCost) }}</p>
              </div>
              <div class="rounded-md border p-3" :class="offerUsage.remainingCost >= 0
                ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20'
                : 'border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20'">
                <p class="text-xs font-semibold" :class="offerUsage.remainingCost >= 0
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'">
                  {{ offerUsage.remainingCost >= 0 ? 'Gjenstår av prosjektpris' : 'Over prosjektpris' }}
                </p>
                <p class="mt-1 text-lg font-bold" :class="offerUsage.remainingCost >= 0
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-red-800 dark:text-red-200'">
                  {{ formatCurrency(Math.abs(offerUsage.remainingCost)) }}
                </p>
              </div>
            </template>
          </div>
          <p v-else class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
            Sett timepris på prosjektet for å følge prosjektkostnad fra tidslogging.
          </p>
          <p v-if="projectHourlyRate && !projectOfferPrice" class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
            Legg til prosjektpris på prosjektet for å se hvor mye av prosjektprisen som er brukt.
          </p>
        </section>

        <!-- Development Board -->
        <section class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <div class="mb-1 flex items-center justify-between gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white">5</span>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Utviklingsboard</h2>
            </div>
            <router-link
              v-if="targetProject"
              :to="createLinks.feature"
              class="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
            >
              + Ny funksjon
            </router-link>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div
              v-for="status in ['PENDING', 'IN_PROGRESS', 'DONE']"
              :key="status"
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <h3 class="mb-3 flex items-center justify-between font-semibold text-gray-900 dark:text-gray-100">
                {{ taskStatusLabel(status) }}
                <span class="rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {{ tasksByStatus(status).length }}
                </span>
              </h3>
              <div class="space-y-2">
                <template v-for="task in tasksByStatus(status).slice(0, 3)" :key="task.id">
                  <router-link
                    v-if="featureTasksLink(task)"
                    :to="featureTasksLink(task)"
                    class="block rounded-lg border border-gray-200 bg-gray-50 p-2 transition hover:border-blue-200 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-800 dark:hover:bg-blue-900/20"
                  >
                    <p class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ task.title }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ task.feature?.name }}</p>
                  </router-link>
                  <div
                    v-else
                    class="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ task.title }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ task.feature?.name }}</p>
                  </div>
                </template>
                <p v-if="tasksByStatus(status).length === 0" class="text-sm text-gray-500 dark:text-gray-400">Tom</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <router-link
              v-if="createLinks.task"
              :to="createLinks.task"
              class="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              + Ny oppgave
            </router-link>
          </div>
        </section>

        <!-- Project Overview & Recent Activity -->
        <section class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <div class="mb-1 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white">6</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Prosjektoversikt</h2>
          </div>

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
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ (project.features || []).length }} funksjoner</p>
                  </div>
                  <span :class="[
                    'rounded-full px-2 py-1 text-xs font-semibold',
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    project.status === 'PLANNED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  ]">
                    {{ projectStatusLabel(project.status) }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useProjectsStore } from '../features/projects/store.js'

const projectStore = useProjectsStore()
const selectedProjectId = ref(null)

const projects = computed(() =>
  (projectStore.projects || []).filter((project) => !['PLANNED', 'ON_HOLD'].includes(project.status))
)

const currentProject = computed(() => {
  if (!selectedProjectId.value) return null
  return projects.value.find((p) => p.id === selectedProjectId.value)
})

const targetProject = computed(() => {
  if (currentProject.value) {
    return currentProject.value
  }

  return projects.value[0] || null
})

const createLinks = computed(() => {
  const project = targetProject.value
  if (!project) {
    return {
      meeting: '/',
      requirement: '/',
      milestone: '/',
      feature: '/',
      task: null
    }
  }

  const firstFeature = (project.features || [])[0]

  return {
    meeting: { name: 'ProjectPlanning', params: { id: project.id }, query: { create: 'meeting' } },
    requirement: { name: 'ProjectPlanning', params: { id: project.id }, query: { create: 'requirement' } },
    milestone: { name: 'ProjectPlanning', params: { id: project.id }, query: { create: 'milestone' } },
    feature: { name: 'Features', params: { id: project.id }, query: { create: 'feature' } },
    task: firstFeature ? { path: `/features/${firstFeature.id}/tasks`, query: { projectId: project.id, create: 'task' } } : null
  }
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

const totalEstimatedMinutes = computed(() => {
  return allTasks.value.reduce((sum, task) => sum + ((Number(task.estimatedHours) || 0) * 60), 0)
})

const totalLoggedMinutes = computed(() => {
  return allTasks.value.reduce((taskSum, task) => {
    const taskMinutes = (task.timeLogs || []).reduce((logSum, log) => logSum + (Number(log.minutes) || 0), 0)
    return taskSum + taskMinutes
  }, 0)
})

const totalVarianceMinutes = computed(() => totalLoggedMinutes.value - totalEstimatedMinutes.value)
const projectHourlyRate = computed(() => {
  const rate = Number(currentProject.value?.hourlyRate)
  if (!Number.isFinite(rate) || rate <= 0) {
    return null
  }

  return rate
})

const projectOfferPrice = computed(() => {
  const offer = Number(currentProject.value?.offerPrice)
  if (!Number.isFinite(offer) || offer <= 0) {
    return null
  }

  return offer
})

const deadlineMilestones = computed(() => {
  return allMilestones.value
    .filter((milestone) => !milestone.completed && milestone.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4)
})

const timePlanning = computed(() => {
  const estimated = totalEstimatedMinutes.value
  const logged = totalLoggedMinutes.value
  const variance = totalVarianceMinutes.value
  const percent = estimated > 0 ? Math.round((logged / estimated) * 100) : 0
  const overBudgetTasks = allTasks.value.filter((task) => {
    const estimatedMinutes = (Number(task.estimatedHours) || 0) * 60
    if (!estimatedMinutes) {
      return false
    }

    const loggedMinutes = (task.timeLogs || []).reduce((sum, log) => sum + (Number(log.minutes) || 0), 0)
    return loggedMinutes > estimatedMinutes
  }).length

  return {
    estimatedHours: (estimated / 60).toFixed(1),
    loggedHours: (logged / 60).toFixed(1),
    varianceHours: (Math.abs(variance) / 60).toFixed(1),
    varianceMinutes: variance,
    progressPercent: Math.min(Math.max(percent, 0), 100),
    overBudgetTasks,
    estimatedCost: ((projectHourlyRate.value || 0) * estimated) / 60,
    loggedCost: ((projectHourlyRate.value || 0) * logged) / 60,
    costVariance: (((projectHourlyRate.value || 0) * logged) / 60) - (((projectHourlyRate.value || 0) * estimated) / 60)
  }
})

const offerUsage = computed(() => {
  const offerPrice = projectOfferPrice.value || 0
  const usedCost = timePlanning.value.loggedCost
  const usedPercent = offerPrice > 0 ? (usedCost / offerPrice) * 100 : 0
  const remainingCost = offerPrice - usedCost

  return {
    usedCost,
    usedPercent,
    remainingCost
  }
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
    TASK_CREATED: 'Oppgave opprettet',
    TASK_COMPLETED: 'Oppgave fullført',
    FEATURE_CREATED: 'Funksjon opprettet',
    FEATURE_COMPLETED: 'Funksjon fullført',
    REQUIREMENT_CREATED: 'Krav opprettet',
    REQUIREMENT_APPROVED: 'Krav godkjent',
    MILESTONE_COMPLETED: 'Milepæl fullført',
    CUSTOMER_MEETING_LOGGED: 'Møte loggført',
    PROJECT_UPDATED: 'Prosjekt oppdatert'
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
  if (!date) return 'Ikke satt'
  return new Date(date).toLocaleDateString('no-NO', { month: 'short', day: 'numeric' })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)
}

function formatRelativeTime(date) {
  if (!date) return 'nå'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'nå'
  if (diffMins < 60) return `${diffMins} min siden`
  if (diffHours < 24) return `${diffHours} t siden`
  if (diffDays < 7) return `${diffDays} d siden`
  return then.toLocaleDateString('no-NO')
}

function statusLabel(status) {
  const labels = {
    OPEN: 'Åpen',
    APPROVED: 'Godkjent',
    REJECTED: 'Avvist'
  }
  return labels[status] || status
}

function taskStatusLabel(status) {
  const labels = {
    PENDING: 'Å gjøre',
    IN_PROGRESS: 'Under arbeid',
    DONE: 'Ferdig'
  }
  return labels[status] || status
}

function projectStatusLabel(status) {
  const labels = {
    PLANNED: 'Planlagt',
    ACTIVE: 'Aktiv',
    COMPLETED: 'Fullført',
    ON_HOLD: 'På vent'
  }
  return labels[status] || status
}

function findMeetingProjectId(meeting) {
  const directProjectId = Number(meeting?.projectId)
  if (Number.isInteger(directProjectId) && directProjectId > 0) {
    return directProjectId
  }

  if (currentProject.value?.id && (currentProject.value.customerMeetings || []).some((m) => m.id === meeting?.id)) {
    return currentProject.value.id
  }

  const project = projects.value.find((p) => (p.customerMeetings || []).some((m) => m.id === meeting?.id))
  return project?.id || null
}

function meetingDetailLink(meeting) {
  const projectId = findMeetingProjectId(meeting)
  if (!projectId || !meeting?.id) {
    return null
  }

  return {
    name: 'MeetingDetail',
    params: {
      projectId,
      id: meeting.id
    }
  }
}

function findFeatureProjectId(featureId) {
  const project = projects.value.find((p) => (p.features || []).some((f) => f.id === featureId))
  return project?.id || null
}

function featureTasksLink(task) {
  const featureId = Number(task?.feature?.id || task?.featureId)
  if (!Number.isInteger(featureId) || featureId <= 0) {
    return null
  }

  const projectId = Number(task?.feature?.projectId) || findFeatureProjectId(featureId)

  return {
    path: `/features/${featureId}/tasks`,
    query: Number.isInteger(projectId) && projectId > 0 ? { projectId } : undefined
  }
}

function milestoneProgressPercent(milestone) {
  return milestone?.completed ? 100 : 0
}

function daysUntil(date) {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  return Math.ceil((targetDate - today) / 86400000)
}

function deadlineLabel(date) {
  const days = daysUntil(date)
  if (days === null) return 'Ingen frist'
  if (days < 0) return `${Math.abs(days)} d forsinket`
  if (days === 0) return 'Forfaller i dag'
  return `${days} d igjen`
}

function milestoneDeadlineClass(days) {
  if (days === null) {
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  if (days < 0) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
  if (days <= 3) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  }
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
}

onMounted(async () => {
  await projectStore.fetchProjects()

  if (!projects.value.length) {
    return
  }

  await Promise.all(
    projects.value.map((project) => projectStore.fetchProjectPlanning(project.id))
  )
})

watch(projects, (nextProjects) => {
  if (!selectedProjectId.value) {
    return
  }

  const stillExists = nextProjects.some((project) => project.id === selectedProjectId.value)
  if (!stillExists) {
    selectedProjectId.value = null
  }
})
</script>
