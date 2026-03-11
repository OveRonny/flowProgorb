<template>
  <div class="p-6 bg-gray-950 min-h-screen">
    <h1 class="text-3xl font-bold mb-2 text-gray-100">Mine Prosjekter</h1>
    <h4 class="font-bold mb-4 text-gray-100">
      Administrer og følg med på alle prosjektene dine
    </h4>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <SearchBar v-model="searchQuery" placeholder="Søk prosjekter..." />
    </div>    

    <button @click="showModal = true" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4">
      Nytt prosjekt
    </button>

    <Modal v-model="showModal" title="Legg til nytt prosjekt">
      <ProjectForm @submit="handleAddProject" />
    </Modal>


    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" @delete="handleDeleteProject"/>
    </div>


  </div>
</template>

<script setup>
import Modal from '../../../components/Modal.vue'
import SearchBar from '../components/SearchBar.vue'
import ProjectForm from '../components/ProjectForm.vue'
import ProjectCard from '../components/ProjectCard.vue'
import { useProjectsStore } from '../store'
import { onMounted, ref, computed } from 'vue'

const showModal = ref(false)
const projects = ref([])

const searchQuery = ref('')
const projectStore = useProjectsStore()

onMounted(() => {
  projectStore.fetchProjects()
})

const filteredProjects = computed(() => {
  return projectStore.projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function handleAddProject(project) {
  
  projectStore.createProject(project)  
  showModal.value = false
}

function handleDeleteProject(projectId) { 
  projectStore.deleteProject(projectId)
}

function openProject(id) {
  console.log('Åpne prosjekt', id)
}
</script>