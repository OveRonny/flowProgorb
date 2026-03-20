import api from '../shared/axiosInstance'

export const fetchProjects = async () => {
    const response = await api.get('/api/projects');
    return response.data;
}

export const fetchProjectById = async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
}

export const fetchProjectPlanning = async (projectId) => {
    try {
        const response = await api.get(`/api/projects/${projectId}/planning`)
        return response.data
    } catch (firstError) {
        try {
            // Backward compatibility for environments exposing routes without /api prefix.
            const response = await api.get(`/api/projects/${projectId}/planning`)
            return response.data
        } catch (secondError) {
            try {
                // Temporary compatibility fallback for older backend deployments
                // where planning data is still embedded in the project payload.
                const response = await api.get(`/api/projects/${projectId}`)
                return {
                    ...response.data,
                    requirements: response.data?.requirements || [],
                    milestones: response.data?.milestones || [],
                    customerMeetings: response.data?.customerMeetings || [],
                    members: response.data?.members || []
                }
            } catch {
                const response = await api.get(`/api/projects/${projectId}`)
                return {
                    ...response.data,
                    requirements: response.data?.requirements || [],
                    milestones: response.data?.milestones || [],
                    customerMeetings: response.data?.customerMeetings || [],
                    members: response.data?.members || []
                }
            }
        }
    }
}

export const createProject = async (projectData) => {    
    const response = await api.post('/api/projects', projectData);
    return response.data;
}

export const updateProject = async (projectId, projectData) => {
    const response = await api.put(`/api/projects/${projectId}`, projectData);
    return response.data;
}

export const deleteProject = async (projectId) => {
    await api.delete(`/api/projects/${projectId}`);
}

export const createProjectFeature = async (projectId, featureData) => {
    const response = await api.post(`/api/api/projects/${projectId}/features`, featureData);
    return response.data;
}

export const updateProjectFeature = async (projectId, featureId, featureData) => {
    const response = await api.put(`/api/projects/${projectId}/features/${featureId}`, featureData);
    return response.data;
}

export const deleteProjectFeature = async (projectId, featureId) => {
    await api.delete(`/api/projects/${projectId}/features/${featureId}`);
}

export const connectProjectGithubRepo = async (projectId, payload) => {
    const response = await api.post(`/api/projects/${projectId}/github/connect`, payload);
    return response.data;
}

export const fetchProjectGithubRepo = async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}/github/repo`);
    return response.data;
}

export const createFeatureGithubIssue = async (projectId, featureId, payload = {}) => {
    const response = await api.post(`/api/projects/${projectId}/features/${featureId}/github/issue`, payload);
    return response.data;
}

export const syncFeatureGithubIssue = async (projectId, featureId) => {
    const response = await api.post(`/api/projects/${projectId}/features/${featureId}/github/issue/sync`);
    return response.data;
}

export const createRequirement = async (projectId, payload) => {
    const response = await api.post(`/api/projects/${projectId}/requirements`, payload)
    return response.data
}

export const updateRequirement = async (projectId, requirementId, payload) => {
    const response = await api.put(`/api/projects/${projectId}/requirements/${requirementId}`, payload)
    return response.data
}

export const deleteRequirement = async (projectId, requirementId) => {
    await api.delete(`/api/projects/${projectId}/requirements/${requirementId}`)
}

export const createMilestone = async (projectId, payload) => {
    const response = await api.post(`/api/projects/${projectId}/milestones`, payload)
    return response.data
}

export const updateMilestone = async (projectId, milestoneId, payload) => {
    const response = await api.put(`/api/projects/${projectId}/milestones/${milestoneId}`, payload)
    return response.data
}

export const deleteMilestone = async (projectId, milestoneId) => {
    await api.delete(`/api/projects/${projectId}/milestones/${milestoneId}`)
}

export const createCustomerMeeting = async (projectId, payload) => {
    const response = await api.post(`/api/projects/${projectId}/customer-meetings`, payload)
    return response.data
}

export const updateCustomerMeeting = async (projectId, meetingId, payload) => {
    const response = await api.put(`/api/projects/${projectId}/customer-meetings/${meetingId}`, payload)
    return response.data
}

export const deleteCustomerMeeting = async (projectId, meetingId) => {
    await api.delete(`/api/projects/${projectId}/customer-meetings/${meetingId}`)
}