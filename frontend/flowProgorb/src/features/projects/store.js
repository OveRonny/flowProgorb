import {
    defineStore
} from 'pinia'
import { fetchProjects, fetchProjectById, createProject, updateProject, deleteProject } from './api'

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [],
        loading: false,
        error: null
    }),
    actions: {  
        async fetchProjects() {
            this.loading = true
            this.error = null
            try {
                this.projects = await fetchProjects()
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load projects'
            } finally {
                this.loading = false
            }
        },
        async fetchProjectById(projectId) {
            this.loading = true
            this.error = null
            try {
                return await fetchProjectById(projectId)
            }
                catch (err) {
                this.error = err.response?.data?.message || 'Failed to load project'
            } finally {
                this.loading = false
            }
        },
        async createProject(projectData) {
            this.loading = true
            this.error = null
            try {
                const newProject = await createProject(projectData)
                this.projects.push(newProject)
            }
                catch (err) {
                this.error = err.response?.data?.message || 'Failed to create project'
            } finally {
                this.loading = false
            }
        },
        async updateProject(projectId, projectData) {
            this.loading = true
            this.error = null
            try {
                const updatedProject = await updateProject(projectId, projectData)
                const index = this.projects.findIndex(p => p.id === projectId)  
                if (index !== -1) {
                    this.projects[index] = updatedProject
                }   
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update project'
            }
                finally {
                this.loading = false
            }   
        },
        async deleteProject(projectId) {
            this.loading = true
            this.error = null
            try {
                await deleteProject(projectId)
                this.projects = this.projects.filter(p => p.id !== projectId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete project'
            } finally {
                this.loading = false
            }

        }
    }

    
})
