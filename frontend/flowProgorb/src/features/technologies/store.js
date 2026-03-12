import {
    defineStore
} from 'pinia'
import {
    fetchTechnologies,
    fetchTechnologyById,
    createTechnology,
    updateTechnology,
    deleteTechnology,
    fetchTechnologyTypes
} from './api'



export const useTechnologiesStore = defineStore('technologies', {
    state: () => ({
        technologies: [],
        types: [],
        loading: false,
        error: null,
        typeLabels: {
            LANGUAGE: "Programmeringsspråk",
            FRAMEWORK: "Rammeverk",
            LIBRARY: "Bibliotek"
        }
    }),
    actions: {
        async fetchTechnologies() {
            this.loading = true
            this.error = null
            try {
                this.technologies = await fetchTechnologies()
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load technologies'
            } finally {
                this.loading = false
            }
        },
        async fetchTechnologyById(technologyId) {
            this.loading = true
            this.error = null
            try {
                return await fetchTechnologyById(technologyId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load technology'
            } finally {
                this.loading = false
            }
        },
        async createTechnology(technologyData) {
            this.loading = true
            this.error = null
            try {
                const newTechnology = await createTechnology(technologyData)
                this.technologies.push(newTechnology)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create technology'
            } finally {
                this.loading = false
            }
        },
        async updateTechnology(technologyId, technologyData) {
            this.loading = true
            this.error = null
            try {
                const updatedTechnology = await updateTechnology(technologyId, technologyData)
                const index = this.technologies.findIndex(t => t.id === technologyId)

                if (index !== -1) {
                    this.technologies[index] = updatedTechnology
                }
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update technology'
            } finally {
                this.loading = false
            }
        },
        async deleteTechnology(technologyId) {
            this.loading = true
            this.error = null
            try {
                await deleteTechnology(technologyId)
                this.technologies = this.technologies.filter(t => t.id !== technologyId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete technology'
            } finally {
                this.loading = false
            }
        },
        async fetchTechnologyTypes() {
            this.loading = true
            this.error = null
            try {
                const types = await fetchTechnologyTypes()
                this.types = Array.isArray(types) ? types : []
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load technology types'
            } finally {
                this.loading = false
            }
        }
    }
})