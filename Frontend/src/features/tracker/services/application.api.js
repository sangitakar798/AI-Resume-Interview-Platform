import axios from 'axios';
const api=axios.create({baseURL:'http://localhost:3000',withCredentials:true});
export const getApplications=()=>api.get('/api/applications').then(r=>r.data);
export const createApplication=payload=>api.post('/api/applications',payload).then(r=>r.data);
export const updateApplication=(id,payload)=>api.patch(`/api/applications/${id}`,payload).then(r=>r.data);
export const deleteApplication=id=>api.delete(`/api/applications/${id}`).then(r=>r.data);
