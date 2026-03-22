import {
    defineStore
} from 'pinia'
import {
    fetchProjects,
    fetchProjectById,
    fetchProjectPlanning,
    fetchProjectVersions,
    createProjectVersion,
    updateProjectVersion,
    deleteProjectVersion,
    createProject,
    updateProject,
    deleteProject,
    createProjectFeature,
    updateProjectFeature,
    deleteProjectFeature,
    connectProjectGithubRepo,
    fetchProjectGithubRepo,
    publishProjectGithubRelease,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createCustomerMeeting,
    updateCustomerMeeting,
    deleteCustomerMeeting,
    createProjectEmail,
    updateProjectEmail,
    deleteProjectEmail
} from './api'

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [],
        project: null,
        planningProject: null,
        versions: [],
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
                this.versions = project.versions || []
                const projectIndex = this.projects.findIndex((p) => p.id === projectId)
                if (projectIndex !== -1) {
                    this.projects[projectIndex] = {
                        ...this.projects[projectIndex],
                        requirements: project.requirements || [],
                        milestones: project.milestones || [],
                        customerMeetings: project.customerMeetings || []
                    }
                }

                if (this.project?.id === projectId) {
                    this.project = {
                        ...this.project,
                        requirements: project.requirements || [],
                        milestones: project.milestones || [],
                        customerMeetings: project.customerMeetings || []
                    }
                }
                return project
            } catch (err) {
                this.error = err.response?.data?.message || err.response?.data?.error || 'Failed to load project planning'
            } finally {
                this.loading = false
            }
        },
        async fetchVersions(projectId) {
            this.loading = true
            this.error = null
            try {
                const versions = await fetchProjectVersions(projectId)
                this.versions = versions || []

                if (this.planningProject?.id === projectId) {
                    this.planningProject = {
                        ...this.planningProject,
                        versions: this.versions
                    }
                }

                return this.versions
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load project versions'
                return []
            } finally {
                this.loading = false
            }
        },
        async createVersion(projectId, payload) {
            this.loading = true
            this.error = null
            try {
                const version = await createProjectVersion(projectId, payload)
                this.versions = [version, ...(this.versions || [])]
                return version
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create version'
                return null
            } finally {
                this.loading = false
            }
        },
        async updateVersion(projectId, versionId, payload) {
            this.loading = true
            this.error = null
            try {
                const version = await updateProjectVersion(projectId, versionId, payload)
                const index = this.versions.findIndex((item) => item.id === versionId)
                if (index !== -1) {
                    this.versions[index] = version
                }
                return version
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update version'
                return null
            } finally {
                this.loading = false
            }
        },
        async deleteVersion(projectId, versionId) {
            this.loading = true
            this.error = null
            try {
                await deleteProjectVersion(projectId, versionId)
                this.versions = this.versions.filter((item) => item.id !== versionId)
                return true
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete version'
                return false
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
                return newProject
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create project'
                return null
            } finally {
                this.loading = false
            }
        },
        async createProjectFromPlanningDraft(draft) {
            this.loading = true
            this.error = null
            try {
                const newProject = await createProject({
                    name: draft?.name,
                    description: draft?.description,
                    deadline: draft?.deadline || null
                })

                this.projects.push(newProject)

                const projectId = newProject.id

                const versionDrafts = Array.isArray(draft?.versions) ? draft.versions : []
                const versionKeyMap = new Map()

                for (const version of versionDrafts) {
                    const versionTag = String(version?.versionTag || '').trim()
                    if (!versionTag) {
                        continue
                    }

                    const createdVersion = await createProjectVersion(projectId, {
                        versionTag,
                        name: String(version?.name || '').trim() || null,
                        channel: 'DEVELOPMENT',
                        status: 'PLANNED'
                    })

                    if (version?.key && createdVersion?.id) {
                        versionKeyMap.set(version.key, createdVersion.id)
                    }
                }

                const meetingDrafts = Array.isArray(draft?.meetings) ? draft.meetings : []
                for (const meeting of meetingDrafts) {
                    if (!meeting?.title) {
                        continue
                    }

                    await createCustomerMeeting(projectId, {
                        title: meeting.title,
                        notes: meeting.notes || '',
                        date: meeting.date || null,
                        attendeeIds: []
                    })
                }

                const requirementDrafts = Array.isArray(draft?.requirements) ? draft.requirements : []
                for (const requirement of requirementDrafts) {
                    if (!requirement?.title) {
                        continue
                    }

                    const targetVersionId = versionKeyMap.get(requirement.versionKey)
                    if (!targetVersionId) {
                        throw new Error('All requirements in planning draft must be assigned to a version')
                    }

                    await createRequirement(projectId, {
                        title: requirement.title,
                        description: requirement.description || '',
                        status: 'OPEN',
                        priority: requirement.priority ?? null,
                        meetingId: null,
                        targetVersionId
                    })
                }

                const milestoneDrafts = Array.isArray(draft?.milestones) ? draft.milestones : []
                for (const milestone of milestoneDrafts) {
                    if (!milestone?.title) {
                        continue
                    }

                    await createMilestone(projectId, {
                        title: milestone.title,
                        description: milestone.description || '',
                        dueDate: milestone.dueDate || null,
                        completed: false,
                        orderIndex: milestone.orderIndex ?? null
                    })
                }

                await this.fetchProjectPlanning(projectId)
                return newProject
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create project from planning draft'
                return null
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
                    this.projects[index] = {
                        ...this.projects[index],
                        ...updatedProject
                    }
                }
                return updatedProject
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update project'
                return null
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
                const result = await updateProjectFeature(projectId, featureId, featureData)
                const index = this.project.features.findIndex(f => f.id === featureId)
                if (index !== -1) {
                    this.project.features[index] = {
                        ...this.project.features[index],
                        ...featureData
                    }
                }
                return result
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update feature'
                return null
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
        async publishGithubRelease(projectId, payload) {
            this.loading = true
            this.error = null
            try {
                return await publishProjectGithubRelease(projectId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to publish GitHub release'
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
        },
        async createProjectEmail(projectId, payload) {
            this.loading = true
            this.error = null
            try {
                return await createProjectEmail(projectId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create project email'
                return null
            } finally {
                this.loading = false
            }
        },
        async updateProjectEmail(projectId, emailId, payload) {
            this.loading = true
            this.error = null
            try {
                return await updateProjectEmail(projectId, emailId, payload)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update project email'
                return null
            } finally {
                this.loading = false
            }
        },
        async deleteProjectEmail(projectId, emailId) {
            this.loading = true
            this.error = null
            try {
                await deleteProjectEmail(projectId, emailId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete project email'
            } finally {
                this.loading = false
            }
        }

      
         
    }


})