import axios from 'axios';
const api = axios.create({ baseURL: 'https://ai-resume-interview-platform-yfgl.onrender.com', withCredentials: true });
export const getResumeDraft = async id => (await api.post(`/api/interview/resume/${id}/draft`)).data;
export const getResumeVersions = async id => (await api.get(`/api/interview/resume/${id}/versions`)).data;
export const saveResumeVersion = async (id, payload) => (await api.post(`/api/interview/resume/${id}/versions`, payload)).data;
export const exportResumePdf = async (id, payload) => (await api.post(`/api/interview/resume/${id}/export`, payload, { responseType: 'blob' })).data;
