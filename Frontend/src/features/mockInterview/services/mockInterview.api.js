import axios from 'axios';
const api = axios.create({ baseURL: 'https://ai-resume-interview-platform-yfgl.onrender.com', withCredentials: true });
export const startMockInterview = payload => api.post('/api/mock-interviews/start', payload).then(r => r.data);
export const getMockInterview = id => api.get(`/api/mock-interviews/${id}`).then(r => r.data);
export const submitMockAnswer = (id, payload) => api.post(`/api/mock-interviews/${id}/answer`, payload).then(r => r.data);
export const completeMockInterview = id => api.post(`/api/mock-interviews/${id}/complete`).then(r => r.data);
