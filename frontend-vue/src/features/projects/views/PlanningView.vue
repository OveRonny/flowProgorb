<template>
  <div class="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl space-y-6">
      <div v-if="project" class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ project.name }} planlegging</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Kundemøter, milepæler og krav</p>
        </div>
        <router-link :to="{ name: 'Features', params: { id: project.id } }" class="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
          Tilbake til funksjoner
        </router-link>
      </div>

      <p v-if="projectStore.error" class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        {{ projectStore.error }}
      </p>

      <section v-if="project" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Versjoner</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Planlagte utviklings- og releaseversjoner</p>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-4">
          <input
            v-model="newVersion.versionTag"
            placeholder="v1.0.0"
            class="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <input
            v-model="newVersion.name"
            placeholder="Navn (valgfritt)"
            class="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <select
            v-model="newVersion.channel"
            class="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="DEVELOPMENT">Utvikling</option>
            <option value="RELEASE">Lansering</option>
          </select>
          <button
            class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            @click="handleCreateVersion"
          >
            Legg til versjon
          </button>
        </div>

        <div class="mt-3 space-y-2">
          <div
            v-for="version in versions"
            :key="version.id"
            class="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ version.versionTag }}</span>
              <span v-if="version.name" class="text-gray-600 dark:text-gray-400">{{ version.name }}</span>
              <span class="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{{ channelLabel(version.channel) }}</span>
              <span class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{{ versionStatusLabel(version.status) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="version.status === 'PLANNED'"
                class="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                @click="markVersionApproved(version.id)"
              >
                Godkjenn
              </button>
              <button
                class="rounded bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600"
                @click="deleteVersion(version.id)"
              >
                Slett
              </button>
            </div>
          </div>
          <p v-if="!versions.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen versjoner opprettet enda.</p>
        </div>
      </section>

      <div v-if="project" class="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-emerald-800 dark:text-emerald-200">
            Status: <span class="font-semibold">{{ projectStatusLabel }}</span>
          </p>
          <button
            v-if="project.status === 'PLANNED'"
            class="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            @click="startProjectDevelopment"
          >
            Kunde godkjent: Start utvikling
          </button>
        </div>
      </div>

      <section v-if="project" class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Tilbudskalkulator</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Regn ut planlagt kostnad, forventet kostnad og anbefalt tilbudspris før prosjektet godkjennes.</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Krav-estimat summerer nå automatisk timer i kalkulatoren.</p>
          </div>
          <p v-if="hourlyRate" class="rounded bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Timepris: {{ formatCurrency(hourlyRate) }} / time
          </p>
        </div>

        <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
          <div class="grid gap-3 md:grid-cols-3">
            <label class="space-y-1">
              <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Prosjekt timepris (kr/time)</span>
              <input
                v-model="pricingInputs.hourlyRate"
                type="number"
                min="0"
                step="1"
                placeholder="F.eks. 1250"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </label>
            <label class="space-y-1">
              <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Prosjektpris (kr)</span>
              <input
                v-model="pricingInputs.offerPrice"
                type="number"
                min="0"
                step="1000"
                placeholder="F.eks. 350000"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </label>
            <div class="flex items-end">
              <button
                class="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="savingPricing || !canSavePricing"
                @click="saveProjectPricing"
              >
                {{ savingPricing ? 'Lagrer...' : 'Lagre prosjektpriser' }}
              </button>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Prisene lagres på prosjektet og brukes i kalkulatoren under.</p>
        </div>

        <p v-if="!hourlyRate" class="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
          Sett timepris på prosjektet for å få kostnadsberegning. Kalkulatoren bruker timepris som grunnlag.
        </p>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label class="space-y-1">
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Estimerte timer (plan)</span>
            <input
              v-model="costInputs.estimatedHours"
              type="number"
              min="0"
              step="0.5"
              :placeholder="`Auto fra krav: ${requirementEstimatedHours.toFixed(1)} t`"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">Tomt felt bruker automatisk sum av kravtimer.</p>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Risiko-påslag (%)</span>
            <input
              v-model="costInputs.riskPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label class="space-y-1">
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Målmargin (%)</span>
            <input
              v-model="costInputs.marginPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label class="space-y-1">
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">Planlagt tilbudspris (kr)</span>
            <input
              v-model="costInputs.proposedPrice"
              type="number"
              min="0"
              step="1000"
              placeholder="Valgfritt"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/40 dark:bg-blue-900/20">
            <p class="text-xs font-semibold text-blue-700 dark:text-blue-300">Planlagt kostnad</p>
            <p class="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">{{ formatCurrency(planningCost.baseCost) }}</p>
            <p class="mt-1 text-xs text-blue-700/80 dark:text-blue-300/80">{{ planningCost.estimatedHours.toFixed(1) }} timer</p>
          </div>
          <div class="rounded-lg border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/40 dark:bg-indigo-900/20">
            <p class="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Forventet kostnad</p>
            <p class="mt-1 text-lg font-bold text-indigo-800 dark:text-indigo-200">{{ formatCurrency(planningCost.expectedCost) }}</p>
            <p class="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/80">inkl. risiko {{ planningCost.riskPercent.toFixed(0) }}%</p>
          </div>
          <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
            <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Anbefalt tilbud</p>
            <p class="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-200">{{ formatCurrency(planningCost.recommendedPrice) }}</p>
            <p class="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">med margin {{ planningCost.marginPercent.toFixed(0) }}%</p>
          </div>
          <div class="rounded-lg border p-3" :class="planningCost.proposedPrice > 0
            ? planningCost.proposedProfit >= 0
              ? 'border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20'
              : 'border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20'
            : 'border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20'">
            <p class="text-xs font-semibold" :class="planningCost.proposedPrice > 0
              ? planningCost.proposedProfit >= 0
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
              : 'text-amber-700 dark:text-amber-300'">
              {{ planningCost.proposedPrice > 0 ? 'Planlagt tilbudslønnsomhet' : 'Legg inn tilbudspris' }}
            </p>
            <p class="mt-1 text-lg font-bold" :class="planningCost.proposedPrice > 0
              ? planningCost.proposedProfit >= 0
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
              : 'text-amber-800 dark:text-amber-200'">
              {{ planningCost.proposedPrice > 0 ? formatCurrency(planningCost.proposedProfit) : '-' }}
            </p>
            <p class="mt-1 text-xs" :class="planningCost.proposedPrice > 0
              ? planningCost.proposedProfit >= 0
                ? 'text-green-700/80 dark:text-green-300/80'
                : 'text-red-700/80 dark:text-red-300/80'
              : 'text-amber-700/80 dark:text-amber-300/80'">
              {{ planningCost.proposedPrice > 0 ? `Margin ${planningCost.proposedMarginPercent.toFixed(1)}%` : 'Sammenlign anbefalt tilbud med kundetilbud.' }}
            </p>
          </div>
        </div>

        <div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Tilbud per versjon</h4>
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">Vis</label>
              <select
                v-model="selectedOfferVersionId"
                class="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="ALL">Alle versjoner</option>
                <option v-for="option in offerVersionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <span class="text-xs text-gray-500 dark:text-gray-400">Sortert etter versjon</span>
            </div>
          </div>

          <div v-if="filteredVersionOfferRows.length" class="overflow-x-auto">
            <table class="min-w-full text-left text-xs">
              <thead>
                <tr class="border-b border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  <th class="px-2 py-2 font-semibold">Versjon</th>
                  <th class="px-2 py-2 font-semibold">Krav</th>
                  <th class="px-2 py-2 font-semibold">Timer</th>
                  <th class="px-2 py-2 font-semibold">Forventet kostnad</th>
                  <th class="px-2 py-2 font-semibold">Anbefalt tilbud</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredVersionOfferRows"
                  :key="row.key"
                  class="border-b border-gray-100 text-gray-700 last:border-b-0 dark:border-gray-700 dark:text-gray-200"
                >
                  <td class="px-2 py-2 font-medium">{{ row.versionLabel }}</td>
                  <td class="px-2 py-2">{{ row.requirementCount }}</td>
                  <td class="px-2 py-2">{{ row.hours.toFixed(1) }} t</td>
                  <td class="px-2 py-2">{{ formatCurrency(row.expectedCost) }}</td>
                  <td class="px-2 py-2">{{ formatCurrency(row.recommendedPrice) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400">Ingen versjonsknyttede krav med estimat enda.</p>
        </div>

        <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Tips: Sett tilbudspris nær anbefalt tilbud for trygg margin. Hvis tilbudslønnsomhet blir negativ, er risiko eller estimat for lavt priset.
        </p>
      </section>

      <div class="grid gap-6 xl:grid-cols-3">
        <section class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Krav</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Krav og avklaringer</p>
              <p class="text-xs font-medium text-blue-700 dark:text-blue-300">Estimert totalt: {{ requirementEstimatedHours.toFixed(1) }} t</p>
            </div>
            <div class="flex items-center gap-2">
              <select
                v-model="selectedRequirementVersionId"
                class="rounded border border-gray-300 bg-white px-2 py-2 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="ALL">Alle versjoner</option>
                <option v-for="version in versions" :key="version.id" :value="String(version.id)">
                  {{ version.versionTag }}
                </option>
              </select>
              <select
                v-model="requirementSortMode"
                class="rounded border border-gray-300 bg-white px-2 py-2 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="VERSION_ASC">Versjon (stigende)</option>
                <option value="VERSION_DESC">Versjon (synkende)</option>
              </select>
              <button :disabled="!versions.length" class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" @click="openRequirementModal()">Ny</button>
            </div>
          </div>
          <p v-if="!versions.length" class="mb-4 text-sm text-amber-600 dark:text-amber-300">Opprett en versjon før du lager krav.</p>
          <div class="space-y-3">
            <article v-for="requirement in displayedRequirements" :key="requirement.id" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <router-link :to="{ name: 'RequirementDetail', params: { projectId: project.id, id: requirement.id } }" class="flex items-start justify-between gap-3 hover:opacity-80">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ requirement.title }}</h4>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ requirement.description || 'Ingen beskrivelse' }}</p>
                </div>
                <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">{{ requirementStatusLabel(requirement.status) }}</span>
              </router-link>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Prioritet: {{ requirement.priority ?? 'Ikke satt' }}
                <span v-if="requirement.meeting"> | Møte: {{ requirement.meeting.title }}</span>
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Funksjoner: {{ (requirement.features || []).map((feature) => feature.name).join(', ') || 'Ingen' }}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Versjon: {{ requirement.targetVersion?.versionTag || 'Ingen' }}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Estimat: {{ formatHours(requirement.estimatedHours) }}
              </p>
              <div class="mt-3 flex gap-2">
                <button class="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600" @click="openRequirementModal(requirement)">Rediger</button>
                <button class="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600" @click="handleDeleteRequirement(requirement)">Slett</button>
              </div>
            </article>
            <p v-if="!requirements.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen krav enda.</p>
          </div>
        </section>

        <section class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Milepæler</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Mål og leveransepunkter</p>
            </div>
            <button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openMilestoneModal()">Ny</button>
          </div>
          <div class="space-y-3">
            <article v-for="milestone in milestones" :key="milestone.id" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <router-link :to="{ name: 'MilestoneDetail', params: { projectId: project.id, id: milestone.id } }" class="flex items-start justify-between gap-3 hover:opacity-80">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ milestone.title }}</h4>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ milestone.description || 'Ingen beskrivelse' }}</p>
                </div>
                <span class="rounded-full px-2 py-1 text-xs font-medium" :class="milestone.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'">
                  {{ milestone.completed ? 'Ferdig' : 'Åpen' }}
                </span>
              </router-link>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Forfall: {{ formatDate(milestone.dueDate) }}</p>
              <div class="mt-3 flex gap-2">
                <button class="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600" @click="openMilestoneModal(milestone)">Rediger</button>
                <button class="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600" @click="handleDeleteMilestone(milestone)">Slett</button>
              </div>
            </article>
            <p v-if="!milestones.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen milepæler enda.</p>
          </div>
        </section>

        <section class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Kundemøter</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Møter, deltakere og oppfølging</p>
            </div>
            <button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openMeetingModal()">Nytt</button>
          </div>
          <div class="space-y-3">
            <article v-for="meeting in customerMeetings" :key="meeting.id" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <router-link :to="{ name: 'MeetingDetail', params: { projectId: project.id, id: meeting.id } }" class="flex items-start justify-between gap-3 hover:opacity-80">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ meeting.title }}</h4>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ meeting.notes || 'Ingen notater' }}</p>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(meeting.date) }}</span>
              </router-link>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Deltakere: {{ formatAttendees(meeting.attendees) }}</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Krav: {{ (meeting.requirements || []).map((requirement) => requirement.title).join(', ') || 'Ingen' }}</p>
              <div class="mt-3 flex gap-2">
                <button class="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600" @click="openMeetingModal(meeting)">Rediger</button>
                <button class="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600" @click="handleDeleteMeeting(meeting)">Slett</button>
              </div>
            </article>
            <p v-if="!customerMeetings.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen kundemøter enda.</p>
          </div>
        </section>

        <section class="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">E-postlogg</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Lagre e-postkommunikasjon på prosjektet</p>
            </div>
            <button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" @click="openEmailModal()">Ny e-post</button>
          </div>
          <div class="space-y-3">
            <article v-for="email in emails" :key="email.id" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ email.subject }}</h4>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Fra: {{ email.sender || 'Ikke satt' }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Til: {{ formatRecipients(email.recipients) }}</p>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(email.sentAt) }}</span>
              </div>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ email.summary || 'Ingen oppsummering' }}</p>
              <div class="mt-3 flex gap-2">
                <button class="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600" @click="openEmailModal(email)">Rediger</button>
                <button class="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600" @click="handleDeleteEmail(email)">Slett</button>
              </div>
            </article>
            <p v-if="!emails.length" class="text-sm text-gray-500 dark:text-gray-400">Ingen e-poster lagret enda.</p>
          </div>
        </section>
      </div>

      <Modal v-model="showRequirementModal" :title="editingRequirement ? 'Rediger krav' : 'Nytt krav'">
        <RequirementForm :requirement="editingRequirement" :meetings="customerMeetings" :versions="versions" @submit="editingRequirement ? handleUpdateRequirement($event) : handleCreateRequirement($event)" />
      </Modal>

      <Modal v-model="showMilestoneModal" :title="editingMilestone ? 'Rediger milepæl' : 'Ny milepæl'">
        <MilestoneForm :milestone="editingMilestone" @submit="editingMilestone ? handleUpdateMilestone($event) : handleCreateMilestone($event)" />
      </Modal>

      <Modal v-model="showMeetingModal" :title="editingMeeting ? 'Rediger kundemøte' : 'Nytt kundemøte'">
        <CustomerMeetingForm :meeting="editingMeeting" :members="projectMembers" @submit="editingMeeting ? handleUpdateMeeting($event) : handleCreateMeeting($event)" />
      </Modal>

      <Modal v-model="showEmailModal" :title="editingEmail ? 'Rediger e-post' : 'Ny e-post'">
        <ProjectEmailForm :email-entry="editingEmail" @submit="editingEmail ? handleUpdateEmail($event) : handleCreateEmail($event)" />
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '../../../components/Modal.vue'
import { confirmDialog } from '../../shared/confirmDialog.js'
import { useProjectsStore } from '../store.js'
import RequirementForm from '../components/RequirementForm.vue'
import MilestoneForm from '../components/MilestoneForm.vue'
import CustomerMeetingForm from '../components/CustomerMeetingForm.vue'
import ProjectEmailForm from '../components/ProjectEmailForm.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectsStore()

const editingRequirement = ref(null)
const editingMilestone = ref(null)
const editingMeeting = ref(null)
const editingEmail = ref(null)
const showRequirementModal = ref(false)
const showMilestoneModal = ref(false)
const showMeetingModal = ref(false)
const showEmailModal = ref(false)
const selectedOfferVersionId = ref('ALL')
const requirementSortMode = ref('VERSION_ASC')
const selectedRequirementVersionId = ref('ALL')
const pricingInputs = ref({
  hourlyRate: '',
  offerPrice: ''
})
const savingPricing = ref(false)

const project = computed(() => projectStore.planningProject)
const requirements = computed(() => project.value?.requirements || [])
const milestones = computed(() => project.value?.milestones || [])
const customerMeetings = computed(() => project.value?.customerMeetings || [])
const emails = computed(() => project.value?.emails || [])
const projectMembers = computed(() => project.value?.members || [])
const versions = computed(() => {
  const source = project.value?.versions || projectStore.versions || []
  return [...source].sort((a, b) => compareVersionTags(a.versionTag, b.versionTag))
})
const requirementEstimatedHours = computed(() => requirements.value.reduce((sum, requirement) => {
  return sum + (Number(requirement.estimatedHours) || 0)
}, 0))
const sortedRequirements = computed(() => {
  return [...requirements.value].sort((a, b) => {
    const aTag = a.targetVersion?.versionTag || 'zzzz'
    const bTag = b.targetVersion?.versionTag || 'zzzz'
    const tagCompare = compareVersionTags(aTag, bTag)
    if (tagCompare !== 0) {
      return tagCompare
    }

    return String(a.title || '').localeCompare(String(b.title || ''), 'no-NO', { sensitivity: 'base' })
  })
})

const displayedRequirements = computed(() => {
  const versionFiltered = selectedRequirementVersionId.value === 'ALL'
    ? sortedRequirements.value
    : sortedRequirements.value.filter((requirement) => String(requirement.targetVersionId || '') === selectedRequirementVersionId.value)

  const sorted = [...versionFiltered]
  if (requirementSortMode.value === 'VERSION_DESC') {
    sorted.reverse()
  }

  return sorted
})

watch(versions, (list) => {
  if (selectedRequirementVersionId.value === 'ALL') {
    return
  }

  const stillExists = list.some((version) => String(version.id) === selectedRequirementVersionId.value)
  if (!stillExists) {
    selectedRequirementVersionId.value = 'ALL'
  }
})
const hourlyRate = computed(() => {
  const rate = Number(project.value?.hourlyRate)
  if (!Number.isFinite(rate) || rate <= 0) {
    return 0
  }

  return rate
})
const canSavePricing = computed(() => {
  if (!project.value?.id) {
    return false
  }

  const normalizeInput = (value) => {
    const trimmed = String(value ?? '').trim()
    return trimmed === '' ? null : Number(trimmed)
  }

  const nextHourlyRate = normalizeInput(pricingInputs.value.hourlyRate)
  const nextOfferPrice = normalizeInput(pricingInputs.value.offerPrice)

  const hasInvalidHourlyRate = nextHourlyRate !== null && (!Number.isFinite(nextHourlyRate) || nextHourlyRate < 0)
  const hasInvalidOfferPrice = nextOfferPrice !== null && (!Number.isFinite(nextOfferPrice) || nextOfferPrice < 0)
  if (hasInvalidHourlyRate || hasInvalidOfferPrice) {
    return false
  }

  const currentHourlyRate = project.value?.hourlyRate ?? null
  const currentOfferPrice = project.value?.offerPrice ?? null

  return nextHourlyRate !== currentHourlyRate || nextOfferPrice !== currentOfferPrice
})

const costInputs = ref({
  estimatedHours: '',
  riskPercent: 15,
  marginPercent: 20,
  proposedPrice: ''
})

const newVersion = ref({
  versionTag: '',
  name: '',
  channel: 'DEVELOPMENT'
})

const projectStatusLabel = computed(() => {
  const labels = {
    PLANNED: 'Planlegging',
    ACTIVE: 'Utvikling',
    COMPLETED: 'Fullført',
    ON_HOLD: 'På vent'
  }

  return labels[project.value?.status] || project.value?.status || 'Ukjent'
})

async function loadPlanning() {
  const projectId = Number(route.params.id)
  if (!projectId) {
    return
  }

  await projectStore.fetchProjectPlanning(projectId)
}

const handleCreateVersion = async () => {
  if (!project.value?.id) {
    return
  }

  const versionTag = String(newVersion.value.versionTag || '').trim()
  if (!versionTag) {
    return
  }

  const created = await projectStore.createVersion(project.value.id, {
    versionTag,
    name: String(newVersion.value.name || '').trim() || null,
    channel: newVersion.value.channel,
    status: 'PLANNED'
  })

  if (!created) {
    return
  }

  newVersion.value = {
    versionTag: '',
    name: '',
    channel: 'DEVELOPMENT'
  }

  await loadPlanning()
}

const markVersionApproved = async (versionId) => {
  if (!project.value?.id) {
    return
  }

  const version = versions.value.find((entry) => entry.id === versionId)
  const confirmed = await confirmDialog.open({
    title: 'Godkjenn versjon',
    message: `Godkjenne versjon ${version?.versionTag || ''}?`,
    details: 'Versjonen blir markert som godkjent i planleggingen.',
    confirmText: 'Godkjenn',
    tone: 'primary'
  })
  if (!confirmed) {
    return
  }

  const updated = await projectStore.updateVersion(project.value.id, versionId, { status: 'APPROVED' })
  if (!updated) {
    return
  }

  await loadPlanning()
}

const deleteVersion = async (versionId) => {
  if (!project.value?.id) {
    return
  }

  const version = versions.value.find((entry) => entry.id === versionId)
  const confirmed = await confirmDialog.open({
    title: 'Slett versjon',
    message: `Slette versjon ${version?.versionTag || ''}?`,
    details: 'Krav som er knyttet til versjonen mister versjonstilknytningen sin.',
    confirmText: 'Slett',
    tone: 'danger'
  })
  if (!confirmed) {
    return
  }

  const deleted = await projectStore.deleteVersion(project.value.id, versionId)
  if (!deleted) {
    return
  }

  await loadPlanning()
}

watch(
  () => route.params.id,
  async () => {
    await loadPlanning()
  },
  { immediate: true }
)

watch(
  () => project.value?.id,
  (projectId) => {
    if (!projectId) {
      return
    }

    const stored = localStorage.getItem(`planning-cost-inputs-${projectId}`)
    if (!stored) {
      costInputs.value = {
        estimatedHours: '',
        riskPercent: 15,
        marginPercent: 20,
        proposedPrice: ''
      }
      return
    }

    try {
      const parsed = JSON.parse(stored)
      costInputs.value = {
        estimatedHours: parsed.estimatedHours ?? '',
        riskPercent: parsed.riskPercent ?? 15,
        marginPercent: parsed.marginPercent ?? 20,
        proposedPrice: parsed.proposedPrice ?? ''
      }
    } catch {
      costInputs.value = {
        estimatedHours: '',
        riskPercent: 15,
        marginPercent: 20,
        proposedPrice: ''
      }
    }
  },
  { immediate: true }
)

watch(
  () => [project.value?.hourlyRate, project.value?.offerPrice],
  () => {
    pricingInputs.value = {
      hourlyRate: project.value?.hourlyRate ?? '',
      offerPrice: project.value?.offerPrice ?? ''
    }
  },
  { immediate: true }
)

watch(
  () => ({ ...costInputs.value }),
  (value) => {
    if (!project.value?.id) {
      return
    }

    localStorage.setItem(`planning-cost-inputs-${project.value.id}`, JSON.stringify(value))
  },
  { deep: true }
)

const planningCost = computed(() => {
  const estimatedInput = String(costInputs.value.estimatedHours ?? '').trim()
  const manualEstimatedHours = estimatedInput === '' ? null : Number(estimatedInput)
  const estimatedHours = Number.isFinite(manualEstimatedHours)
    ? Math.max(manualEstimatedHours, 0)
    : requirementEstimatedHours.value
  const riskPercent = Math.min(Math.max(Number(costInputs.value.riskPercent) || 0, 0), 100)
  const marginPercent = Math.min(Math.max(Number(costInputs.value.marginPercent) || 0, 0), 100)
  const proposedPrice = Math.max(Number(costInputs.value.proposedPrice) || 0, 0)

  const baseCost = hourlyRate.value > 0 ? hourlyRate.value * estimatedHours : 0
  const expectedCost = baseCost * (1 + (riskPercent / 100))
  const recommendedPrice = expectedCost * (1 + (marginPercent / 100))
  const proposedProfit = proposedPrice - expectedCost
  const proposedMarginPercent = proposedPrice > 0 ? (proposedProfit / proposedPrice) * 100 : 0

  return {
    estimatedHours,
    riskPercent,
    marginPercent,
    proposedPrice,
    baseCost,
    expectedCost,
    recommendedPrice,
    proposedProfit,
    proposedMarginPercent
  }
})

const versionOfferRows = computed(() => {
  const riskFactor = 1 + (planningCost.value.riskPercent / 100)
  const marginFactor = 1 + (planningCost.value.marginPercent / 100)

  const rows = versions.value.map((version) => {
    const relatedRequirements = requirements.value.filter((requirement) => requirement.targetVersionId === version.id)
    const hours = relatedRequirements.reduce((sum, requirement) => sum + (Number(requirement.estimatedHours) || 0), 0)
    const baseCost = hourlyRate.value * hours
    const expectedCost = baseCost * riskFactor
    const recommendedPrice = expectedCost * marginFactor

    return {
      key: `version-${version.id}`,
      versionLabel: version.versionTag,
      requirementCount: relatedRequirements.length,
      hours,
      expectedCost,
      recommendedPrice
    }
  }).filter((row) => row.requirementCount > 0)

  const unassignedRequirements = requirements.value.filter((requirement) => !requirement.targetVersionId)
  if (unassignedRequirements.length) {
    const unassignedHours = unassignedRequirements.reduce((sum, requirement) => sum + (Number(requirement.estimatedHours) || 0), 0)
    const unassignedExpectedCost = (hourlyRate.value * unassignedHours) * riskFactor
    rows.push({
      key: 'version-unassigned',
      versionLabel: 'Uten versjon',
      requirementCount: unassignedRequirements.length,
      hours: unassignedHours,
      expectedCost: unassignedExpectedCost,
      recommendedPrice: unassignedExpectedCost * marginFactor
    })
  }

  return rows
})

const offerVersionOptions = computed(() => {
  return versionOfferRows.value.map((row) => ({
    value: row.key,
    label: row.versionLabel
  }))
})

const filteredVersionOfferRows = computed(() => {
  if (selectedOfferVersionId.value === 'ALL') {
    return versionOfferRows.value
  }

  return versionOfferRows.value.filter((row) => row.key === selectedOfferVersionId.value)
})

watch(versionOfferRows, (rows) => {
  if (selectedOfferVersionId.value === 'ALL') {
    return
  }

  const hasSelectedVersion = rows.some((row) => row.key === selectedOfferVersionId.value)
  if (!hasSelectedVersion) {
    selectedOfferVersionId.value = 'ALL'
  }
})

function compareVersionTags(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'no-NO', { numeric: true, sensitivity: 'base' })
}

const openRequirementModal = (requirement = null) => {
  editingRequirement.value = requirement
  showRequirementModal.value = true
}

const openMilestoneModal = (milestone = null) => {
  editingMilestone.value = milestone
  showMilestoneModal.value = true
}

const openMeetingModal = (meeting = null) => {
  editingMeeting.value = meeting
  showMeetingModal.value = true
}

const openEmailModal = (email = null) => {
  editingEmail.value = email
  showEmailModal.value = true
}

watch(
  () => route.query.create,
  () => {
    const createTarget = String(route.query.create || '').toLowerCase()

    if (createTarget === 'requirement') {
      openRequirementModal()
    }

    if (createTarget === 'milestone') {
      openMilestoneModal()
    }

    if (createTarget === 'meeting') {
      openMeetingModal()
    }
  },
  { immediate: true }
)

const handleCreateRequirement = async (payload) => {
  const created = await projectStore.createRequirement(project.value.id, payload)
  if (!created) {
    return
  }

  await loadPlanning()
  showRequirementModal.value = false
}

const handleUpdateRequirement = async (payload) => {
  const updated = await projectStore.updateRequirement(project.value.id, editingRequirement.value.id, payload)
  if (!updated) {
    return
  }

  await loadPlanning()
  editingRequirement.value = null
  showRequirementModal.value = false
}

const handleDeleteRequirement = async (requirement) => {
  const confirmed = await confirmDialog.open({
    title: 'Slett krav',
    message: `Slette kravet ${requirement.title}?`,
    details: 'Dette fjerner kravet fra planleggingen.',
    confirmText: 'Slett',
    tone: 'danger'
  })
  if (!confirmed) {
    return
  }

  await projectStore.deleteRequirement(project.value.id, requirement.id)
  await loadPlanning()
}

const handleCreateMilestone = async (payload) => {
  const created = await projectStore.createMilestone(project.value.id, payload)
  if (!created) {
    return
  }

  await loadPlanning()
  showMilestoneModal.value = false
}

const handleUpdateMilestone = async (payload) => {
  const updated = await projectStore.updateMilestone(project.value.id, editingMilestone.value.id, payload)
  if (!updated) {
    return
  }

  await loadPlanning()
  editingMilestone.value = null
  showMilestoneModal.value = false
}

const handleDeleteMilestone = async (milestone) => {
  const confirmed = await confirmDialog.open({
    title: 'Slett milepæl',
    message: `Slette milepælen ${milestone.title}?`,
    details: 'Milepælen blir fjernet fra prosjektplanen.',
    confirmText: 'Slett',
    tone: 'danger'
  })
  if (!confirmed) {
    return
  }

  await projectStore.deleteMilestone(project.value.id, milestone.id)
  await loadPlanning()
}

const handleCreateMeeting = async (payload) => {
  const created = await projectStore.createCustomerMeeting(project.value.id, payload)
  if (!created) {
    return
  }

  await loadPlanning()
  showMeetingModal.value = false
}

const handleUpdateMeeting = async (payload) => {
  const updated = await projectStore.updateCustomerMeeting(project.value.id, editingMeeting.value.id, payload)
  if (!updated) {
    return
  }

  await loadPlanning()
  editingMeeting.value = null
  showMeetingModal.value = false
}

const handleDeleteMeeting = async (meeting) => {
  const confirmed = await confirmDialog.open({
    title: 'Slett kundemøte',
    message: `Slette møtet ${meeting.title}?`,
    details: 'Møtet og tilknyttet planleggingskontekst fjernes.',
    confirmText: 'Slett',
    tone: 'danger'
  })
  if (!confirmed) {
    return
  }

  await projectStore.deleteCustomerMeeting(project.value.id, meeting.id)
  await loadPlanning()
}

const handleCreateEmail = async (payload) => {
  const created = await projectStore.createProjectEmail(project.value.id, payload)
  if (!created) {
    return
  }

  await loadPlanning()
  showEmailModal.value = false
}

const handleUpdateEmail = async (payload) => {
  const updated = await projectStore.updateProjectEmail(project.value.id, editingEmail.value.id, payload)
  if (!updated) {
    return
  }

  await loadPlanning()
  editingEmail.value = null
  showEmailModal.value = false
}

const handleDeleteEmail = async (email) => {
  const confirmed = await confirmDialog.open({
    title: 'Slett e-post',
    message: `Slette e-posten ${email.subject}?`,
    details: 'E-postloggen blir fjernet fra prosjektet.',
    confirmText: 'Slett',
    tone: 'danger'
  })
  if (!confirmed) {
    return
  }

  await projectStore.deleteProjectEmail(project.value.id, email.id)
  await loadPlanning()
}

const startProjectDevelopment = async () => {
  if (!project.value?.id) {
    return
  }

  const confirmed = await confirmDialog.open({
    title: 'Start utvikling',
    message: `Flytte prosjektet ${project.value.name} fra planlegging til utvikling?`,
    details: 'Prosjektstatus blir endret til Utvikling.',
    confirmText: 'Start utvikling',
    tone: 'primary'
  })
  if (!confirmed) {
    return
  }

  const updated = await projectStore.updateProject(project.value.id, { status: 'ACTIVE' })
  if (!updated) {
    return
  }

  await loadPlanning()
  router.push({ name: 'Features', params: { id: project.value.id } })
}

const saveProjectPricing = async () => {
  if (!project.value?.id || !canSavePricing.value) {
    return
  }

  const parseValue = (value) => {
    const trimmed = String(value ?? '').trim()
    if (trimmed === '') {
      return null
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }

  savingPricing.value = true
  try {
    const updated = await projectStore.updateProject(project.value.id, {
      hourlyRate: parseValue(pricingInputs.value.hourlyRate),
      offerPrice: parseValue(pricingInputs.value.offerPrice)
    })
    if (!updated) {
      return
    }

    await loadPlanning()
  } finally {
    savingPricing.value = false
  }
}

const formatDate = (value) => {
  if (!value) {
    return 'Ikke satt'
  }

  return new Date(value).toLocaleDateString('no-NO')
}

const formatDateTime = (value) => {
  if (!value) {
    return 'Ikke satt'
  }

  return new Date(value).toLocaleString('no-NO')
}

const formatAttendees = (attendees = []) => {
  if (!attendees.length) {
    return 'Ingen deltakere'
  }

  return attendees.map((attendee) => attendee.githubLogin || attendee.email).join(', ')
}

const formatRecipients = (recipients = []) => {
  if (!recipients.length) {
    return 'Ingen mottakere'
  }

  return recipients.join(', ')
}

const requirementStatusLabel = (status) => {
  const labels = {
    OPEN: 'Åpen',
    APPROVED: 'Godkjent',
    IMPLEMENTED: 'Implementert',
    REJECTED: 'Avvist'
  }

  return labels[status] || status
}

const channelLabel = (channel) => {
  const labels = {
    DEVELOPMENT: 'Utvikling',
    RELEASE: 'Lansering'
  }

  return labels[channel] || channel
}

const versionStatusLabel = (status) => {
  const labels = {
    PLANNED: 'Planlagt',
    APPROVED: 'Godkjent',
    RELEASED: 'Lansert'
  }

  return labels[status] || status
}

const formatCurrency = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return '0 kr'
  }

  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
  }).format(number)
}

const formatHours = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return 'Ikke estimert'
  }

  return `${number.toFixed(1)} t`
}
</script>