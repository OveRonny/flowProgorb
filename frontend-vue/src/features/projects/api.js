import api from '../shared/axiosInstance'

export const fetchProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
}

export const fetchProjectById = async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
}

export const createProject = async (projectData) => {    
    const response = await api.post('/projects', projectData);
    return response.data;
}

export const updateProject = async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
}

export const deleteProject = async (projectId) => {
    await api.delete(`/projects/${projectId}`);
}

export const createProjectFeature = async (projectId, featureData) => {
    const response = await api.post(`/api/projects/${projectId}/features`, featureData);
    return response.data;
}

export const updateProjectFeature = async (projectId, featureId, featureData) => {
    const response = await api.put(`/api/projects/${projectId}/features/${featureId}`, featureData);
    return response.data;
}

export const deleteProjectFeature = async (projectId, featureId) => {
    await api.delete(`/api/projects/${projectId}/features/${featureId}`);
}