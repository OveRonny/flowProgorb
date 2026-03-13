import api from '../shared/axiosInstance'

export const fetchTechnologies = async () => {
    const response = await api.get('/api/technologies');
    return response.data;
}

export const fetchTechnologyById = async (technologyId) => {
    const response = await api.get(`/api/technologies/${technologyId}`);
    return response.data;
}

export const createTechnology = async (technologyData) => {    
    const response = await api.post('/api/technologies', technologyData);
    return response.data;
}

export const updateTechnology = async (technologyId, technologyData) => {
    const response = await api.put(`/api/technologies/${technologyId}`, technologyData);
    return response.data;
}

export const deleteTechnology = async (technologyId) => {
    await api.delete(`/api/technologies/${technologyId}`);
}

export const fetchTechnologyTypes = async () => {
    const response = await api.get('/api/technologies/types');
    return response.data;
}