import {
    defineStore
} from 'pinia'
import {
    fetchModules,
    fetchModuleById,
    createModule,
    updateModule,
    deleteModule,
} from './api'

export const useModulesStore = defineStore('modules', {
    state: () => ({
        modules: [],
        module: null,
        loading: false,
        error: null
    }),
    actions: {
        async fetchModules() {
            this.loading = true
            this.error = null
            try {
                this.modules = await fetchModules()
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load modules'
            }
            finally {
                this.loading = false
            }
        },
        async fetchModuleById(moduleId) {
            this.loading = true
            this.error = null
            try {
                const module = await fetchModuleById(moduleId)
                this.module = module
                return module
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load module'
            }
            finally {                
                this.loading = false
            }   
        },
        async createModule(moduleData) {
            this.loading = true
            this.error = null
            try {
                const newModule = await createModule(moduleData)
                this.modules.push(newModule)
                return newModule
            }
            catch (err) {
                this.error = err.response?.data?.message || 'Failed to create module'
                return null
            }
            finally {
                this.loading = false
            }
        },
        async updateModule(moduleId, moduleData) {
            this.loading = true 
            this.error = null
            try {
                const updatedModule = await updateModule(moduleId, moduleData)
                const index = this.modules.findIndex(m => m.id === moduleId)
                if (index !== -1) {
                    this.modules[index] = updatedModule
                    // Ensure table re-renders even when internals keep same array reference.
                    this.modules = [...this.modules]
                }
                return updatedModule
            }
            catch (err) {
                this.error = err.response?.data?.message || 'Failed to update module'
                return null
            }
            finally {
                this.loading = false
            }
        },
        async deleteModule(moduleId) {
            this.loading = true
            this.error = null
            try {
                await deleteModule(moduleId)
                this.modules = this.modules.filter(m => m.id !== moduleId)
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete module'
            } finally {
                this.loading = false
            }
        },
    }
})  

