import {
    defineStore
} from 'pinia'
import {
    fetchTasks as fetchTasksApi,
    fetchTaskById as fetchTaskByIdApi,
    createTask as createTaskApi,
    updateTask as updateTaskApi,
    deleteTask as deleteTaskApi,
    fetchTaskTimeLogs as fetchTaskTimeLogsApi,
    createTaskTimeLog as createTaskTimeLogApi,
    updateTaskTimeLog as updateTaskTimeLogApi,
    deleteTaskTimeLog as deleteTaskTimeLogApi,
} from './api'

export const useTasksStore = defineStore('tasks', {
    state: () => ({
        tasks: [],
        task: null,
        timeLogsByTask: {},
        loading: false,
        error: null
    }),
    actions: {
        syncTaskTimeLogs(taskId, logs) {
            this.timeLogsByTask[taskId] = logs
            const index = this.tasks.findIndex(t => t.id === taskId)
            if (index !== -1) {
                this.tasks[index] = {
                    ...this.tasks[index],
                    timeLogs: logs
                }
            }
        },
        async fetchTasks(featureId) {
            this.loading = true
            this.error = null
            try {
                this.tasks = await fetchTasksApi(featureId)
                this.timeLogsByTask = this.tasks.reduce((acc, task) => {
                    acc[task.id] = task.timeLogs ?? []
                    return acc
                }, {})
            }
            catch (err) {
                this.error = err.response?.data?.message || 'Failed to load tasks'
            }
            finally {
                this.loading = false
            }   
        },
        async fetchTaskById(featureId, taskId) {
            this.loading = true
            this.error = null
            try {
                const task = await fetchTaskByIdApi(featureId, taskId)
                this.task = task
                this.syncTaskTimeLogs(taskId, task.timeLogs ?? [])
                return task
            }
            catch (err) {
                this.error = err.response?.data?.message || 'Failed to load task'
            }
            finally {
                this.loading = false
            }
        },
        async createTask(featureId, taskData) {
            this.loading = true
            this.error = null
            try {
                const newTask = await createTaskApi(featureId, taskData)
                this.tasks.push(newTask)
                this.syncTaskTimeLogs(newTask.id, newTask.timeLogs ?? [])
            }   
            catch (err) {
                this.error = err.response?.data?.message || 'Failed to create task'
            }
            finally {
                this.loading = false
            }
        },
        async updateTask(featureId, taskId, taskData) {
            this.loading = true
            this.error = null
            try {   
                const updatedTask = await updateTaskApi(featureId, taskId, taskData)
                const index = this.tasks.findIndex(t => t.id === taskId)
                if (index !== -1) {
                    this.tasks[index] = updatedTask
                }
                this.syncTaskTimeLogs(taskId, updatedTask.timeLogs ?? this.timeLogsByTask[taskId] ?? [])
            }
            catch (err) {
                this.error = err.response?.data?.message || 'Failed to update task'
            }
            finally {
                this.loading = false
            }
        },
        async deleteTask(featureId, taskId) {
            this.loading = true
            this.error = null
            try {
                await deleteTaskApi(featureId, taskId)
                const index = this.tasks.findIndex(t => t.id === taskId)
                if (index !== -1) {
                    this.tasks.splice(index, 1)
                }
                delete this.timeLogsByTask[taskId]
            }
            catch (err) {   
                this.error = err.response?.data?.message || 'Failed to delete task'
            }
            finally {
                this.loading = false
            }
        },
        async fetchTaskTimeLogs(featureId, taskId) {
            this.loading = true
            this.error = null
            try {
                const logs = await fetchTaskTimeLogsApi(featureId, taskId)
                this.syncTaskTimeLogs(taskId, logs)
                return logs
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load task time logs'
            } finally {
                this.loading = false
            }
        },
        async createTaskTimeLog(featureId, taskId, timeLogData) {
            this.loading = true
            this.error = null
            try {
                const newLog = await createTaskTimeLogApi(featureId, taskId, timeLogData)
                const currentLogs = this.timeLogsByTask[taskId] ?? []
                this.syncTaskTimeLogs(taskId, [newLog, ...currentLogs])
                return newLog
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to create task time log'
            } finally {
                this.loading = false
            }
        },
        async updateTaskTimeLog(featureId, taskId, timeLogId, timeLogData) {
            this.loading = true
            this.error = null
            try {
                const updatedLog = await updateTaskTimeLogApi(featureId, taskId, timeLogId, timeLogData)
                const currentLogs = this.timeLogsByTask[taskId] ?? []
                this.syncTaskTimeLogs(
                    taskId,
                    currentLogs.map(log => (log.id === timeLogId ? updatedLog : log))
                )
                return updatedLog
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to update task time log'
            } finally {
                this.loading = false
            }
        },
        async deleteTaskTimeLog(featureId, taskId, timeLogId) {
            this.loading = true
            this.error = null
            try {
                await deleteTaskTimeLogApi(featureId, taskId, timeLogId)
                const currentLogs = this.timeLogsByTask[taskId] ?? []
                this.syncTaskTimeLogs(taskId, currentLogs.filter(log => log.id !== timeLogId))
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to delete task time log'
            } finally {
                this.loading = false
            }
        }
    }
})