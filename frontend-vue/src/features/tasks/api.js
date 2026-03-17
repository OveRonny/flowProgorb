import api from '../shared/axiosInstance'

export const fetchTasks = async (featureId) => {
    const response = await api.get(`/api/features/${featureId}/tasks`);
    return response.data;
}

export const fetchTaskById = async (featureId, taskId) => {
    const response = await api.get(`/api/features/${featureId}/tasks/${taskId}`);
    return response.data;
}

export const createTask = async (featureId, taskData) => {
    const response = await api.post(`/api/features/${featureId}/tasks`, taskData);
    return response.data;
}

export const updateTask = async (featureId, taskId, taskData) => {
    const response = await api.put(`/api/features/${featureId}/tasks/${taskId}`, taskData);
    return response.data;
}

export const deleteTask = async (featureId, taskId) => {
  await api.delete(`/api/features/${featureId}/tasks/${taskId}`)
}

export const fetchTaskTimeLogs = async (featureId, taskId) => {
    const response = await api.get(`/api/features/${featureId}/tasks/${taskId}/time-logs`)
    return response.data
}

export const createTaskTimeLog = async (featureId, taskId, timeLogData) => {
    const response = await api.post(`/api/features/${featureId}/tasks/${taskId}/time-logs`, timeLogData)
    return response.data
}

export const updateTaskTimeLog = async (featureId, taskId, timeLogId, timeLogData) => {
    const response = await api.put(`/api/features/${featureId}/tasks/${taskId}/time-logs/${timeLogId}`, timeLogData)
    return response.data
}

export const deleteTaskTimeLog = async (featureId, taskId, timeLogId) => {
    await api.delete(`/api/features/${featureId}/tasks/${taskId}/time-logs/${timeLogId}`)
}