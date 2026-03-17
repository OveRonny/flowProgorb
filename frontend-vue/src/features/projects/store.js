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
    updateProjectFeature,
    deleteProjectFeature,
    connectProjectGithubRepo,
    fetchProjectGithubRepo,
    createFeatureGithubIssue,
    syncFeatureGithubIssue
} from './api'

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [],
        project: null,
        githubRepo: null,
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
            async createProjectFeature(projectId, featureData) {
            this.loading = true
            this.error = null
            try {
                return await createProjectFeature(projectId, featureData)
            }
                catch (err) {
                this.error = err.response?.data?.message || 'Failed to add feature to project'
            } finally {
                this.loading = false
            }   
        },
        async updateProjectFeature(projectId, featureId, featureData) {
            this.loading = true
            this.error = null
            try {     
                await updateProjectFeature(projectId, featureId, featureData)
                const index = this.project.features.findIndex(f => f.id === featureId)
                if (index !== -1) {
                    this.project.features[index] = {
                        ...this.project.features[index],
                        ...featureData
                    }
                }
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update feature'
            }
                finally {
                this.loading = false
            }
        },
        async deleteProjectFeature(projectId, featureId) {
            this.loading = true
            this.error = null
            try {
                console.log('Deleting feature', featureId, 'from project', projectId)
                await deleteProjectFeature(projectId, featureId)
                const index = this.project.features.findIndex(f => f.id === featureId)
                if (index !== -1) {
                    this.project.features.splice(index, 1)
                }
            }
                catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete feature'
            } finally {
                this.loading = false
            }
        },
        async connectGithubRepo(projectId, payload) {
            this.loading = true
            this.error = null
            try {
                const result = await connectProjectGithubRepo(projectId, payload)
                if (this.project && this.project.id === projectId) {
                    this.project = {
                        ...this.project,
                        githubOwner: result.githubOwner,
                        githubRepoName: result.githubRepoName,
                        githubRepoId: result.githubRepoId,
                        githubDefaultBranch: result.githubDefaultBranch,
                        githubRepoUrl: result.githubRepoUrl
                    }
                }
                return result
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to connect GitHub repo'
                return null
            } finally {
                this.loading = false
            }
        },
        async fetchGithubRepo(projectId) {
            this.loading = true
            this.error = null
            try {
                const result = await fetchProjectGithubRepo(projectId)
                this.githubRepo = result
                return result
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load GitHub repo details'
                return null
            } finally {
                this.loading = false
            }
        },
        async createGithubIssueForFeature(projectId, featureId, payload = {}) {
            this.loading = true
            this.error = null
            try {
                return await createFeatureGithubIssue(projectId, featureId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create GitHub issue'
                return null
            } finally {
                this.loading = false
            }
        },
        async syncGithubIssueForFeature(projectId, featureId) {
            this.loading = true
            this.error = null
            try {
                return await syncFeatureGithubIssue(projectId, featureId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to sync GitHub issue'
                return null
            } finally {
                this.loading = false
            }
        }

      
         
    }


})