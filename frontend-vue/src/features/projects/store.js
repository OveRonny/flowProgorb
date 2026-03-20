import {
    defineStore
} from 'pinia'
import {
    fetchProjects,
    fetchProjectById,
    fetchProjectPlanning,
    createProject,
    updateProject,
    deleteProject,
    createProjectFeature,
    updateProjectFeature,
    deleteProjectFeature,
    connectProjectGithubRepo,
    fetchProjectGithubRepo,
    createFeatureGithubIssue,
    syncFeatureGithubIssue,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createCustomerMeeting,
    updateCustomerMeeting,
    deleteCustomerMeeting
} from './api'

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [],
        project: null,
        planningProject: null,
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
                this.projects = []
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
        async fetchProjectPlanning(projectId) {
            this.loading = true
            this.error = null
            try {
                const project = await fetchProjectPlanning(projectId)
                this.planningProject = project
                return project
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load project planning'
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
        },
        async createRequirement(projectId, payload) {
            this.loading = true
            this.error = null
            try {
                return await createRequirement(projectId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create requirement'
                return null
            } finally {
                this.loading = false
            }
        },
        async updateRequirement(projectId, requirementId, payload) {
            this.loading = true
            this.error = null
            try {
                return await updateRequirement(projectId, requirementId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update requirement'
                return null
            } finally {
                this.loading = false
            }
        },
        async deleteRequirement(projectId, requirementId) {
            this.loading = true
            this.error = null
            try {
                await deleteRequirement(projectId, requirementId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete requirement'
            } finally {
                this.loading = false
            }
        },
        async createMilestone(projectId, payload) {
            this.loading = true
            this.error = null
            try {
                return await createMilestone(projectId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create milestone'
                return null
            } finally {
                this.loading = false
            }
        },
        async updateMilestone(projectId, milestoneId, payload) {
            this.loading = true
            this.error = null
            try {
                return await updateMilestone(projectId, milestoneId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update milestone'
                return null
            } finally {
                this.loading = false
            }
        },
        async deleteMilestone(projectId, milestoneId) {
            this.loading = true
            this.error = null
            try {
                await deleteMilestone(projectId, milestoneId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete milestone'
            } finally {
                this.loading = false
            }
        },
        async createCustomerMeeting(projectId, payload) {
            this.loading = true
            this.error = null
            try {
                return await createCustomerMeeting(projectId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create customer meeting'
                return null
            } finally {
                this.loading = false
            }
        },
        async updateCustomerMeeting(projectId, meetingId, payload) {
            this.loading = true
            this.error = null
            try {
                return await updateCustomerMeeting(projectId, meetingId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update customer meeting'
                return null
            } finally {
                this.loading = false
            }
        },
        async deleteCustomerMeeting(projectId, meetingId) {
            this.loading = true
            this.error = null
            try {
                await deleteCustomerMeeting(projectId, meetingId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete customer meeting'
            } finally {
                this.loading = false
            }
        }

      
         
    }


})