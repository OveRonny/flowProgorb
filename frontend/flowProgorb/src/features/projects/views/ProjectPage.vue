<template>
   <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <ProjectForm @submit="handleSubmit" />
    </div> 
</template>

<script setup>
import ProjectForm from '../components/ProjectForm.vue';
import { useRouter } from "vue-router"
import { useProjectsStore } from '../store';

const router = useRouter()
const projectsStore = useProjectsStore()

async function handleSubmit(projectData) {
  try {
    await projectsStore.createProject(projectData) 

    router.push("/") 

  } catch (err) {
    console.error("Project creation failed:", err)
  }
}

</script>