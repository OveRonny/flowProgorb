import api from '../shared/axiosInstance'

export const fetchModules = async () => {
    const response = await api.get('/api/modules');
    return response.data;
}

export const fetchModuleById = async (moduleId) => {
    const response = await api.get(`/api/modules/${moduleId}`);
    return response.data;
}

export const createModule = async (moduleData) => {    
    const response = await api.post('/api/modules', moduleData);
    return response.data;
}

export const updateModule = async (moduleId, moduleData) => {
    const response = await api.put(`/api/modules/${moduleId}`, moduleData);
    return response.data;
}

export const deleteModule = async (moduleId) => {
    await api.delete(`/api/modules/${moduleId}`);
}
