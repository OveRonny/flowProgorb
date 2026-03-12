import {
    defineStore
} from 'pinia'
import {
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    createProjectFeature,
    fetchFeaturesTasks,
    addTaskToFeature as addTaskToFeatureApi
} from './api'

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [],
        project: null,
        tasks: {},
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
                const project = await fetchProjectById(projectId)
                this.project = project
                return project
            } catch (err) {
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
            } catch (err) {
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
            } finally {
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

        },
        async addFeatureToModule(projectId, featureData) {
            this.loading = true
            this.error = null
            try {
                return await createProjectFeature(projectId, featureData)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create feature'
                throw err
            } finally {
                this.loading = false
            }
        },
        async fetchTasksForFeature(featureId) {      
            
            if (!featureId) return;

            this.loading = true;
            this.error = null;             
            try {
                // kall backend service med featureId                   
                const id = Number(featureId);
                const response = await fetchFeaturesTasks(id); // lage dette i api.js                
                this.tasks[id] = response; // lagrer tasks i store
                return response;
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load tasks';
            } finally {
                this.loading = false;
            }
        },
        async createTaskForFeature(featureId, taskData) {
            if (!featureId) return
            const id = Number(featureId)

            this.loading = true
            this.error = null
            try {
                const response = await addTaskToFeatureApi(id, taskData)
                if (!Array.isArray(this.tasks[id])) {
                    this.tasks[id] = []
                }
                this.tasks[id].push(response)
                return response
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create task'
                throw err
            } finally {
                this.loading = false
            }
        }

            // Dette vil sannsynligvis involvere et API-kall og oppdatering av tasks i store
         
    }


})