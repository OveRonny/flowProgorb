import api from '../shared/axiosInstance'

export const fetchTechnologies = async () => {
    const response = await api.get('/technologies');
    return response.data;
}

export const fetchTechnologyById = async (technologyId) => {
    const response = await api.get(`/technologies/${technologyId}`);
    return response.data;
}

export const createTechnology = async (technologyData) => {    
    const response = await api.post('/technologies', technologyData);
    return response.data;
}

export const updateTechnology = async (technologyId, technologyData) => {
    const response = await api.put(`/technologies/${technologyId}`, technologyData);
    return response.data;
}

export const deleteTechnology = async (technologyId) => {
    await api.delete(`/technologies/${technologyId}`);
}

export const fetchTechnologyTypes = async () => {
    const response = await api.get('/technologies/types');
    return response.data;
}