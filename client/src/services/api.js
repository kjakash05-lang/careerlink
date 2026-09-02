import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : rawBaseUrl.endsWith('/')
  ? `${rawBaseUrl}api`
  : `${rawBaseUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('careerlink_token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('careerlink_auth_invalid'));
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// API Endpoints Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
};

export const profileService = {
  getProfile: (id) => api.get(`/profile/${id}`),
  getPublicProfile: (identifier) => api.get(`/users/public/${identifier}`),
  getMyProfile: () => api.get('/profile/me'),
  updateProfile: (data) => api.put('/profile/me', data),
  addExperience: (data) => api.post('/profile/experience', data),
  deleteExperience: (id) => api.delete(`/profile/experience/${id}`),
  addEducation: (data) => api.post('/profile/education', data),
  deleteEducation: (id) => api.delete(`/profile/education/${id}`),
  addSkill: (name) => api.post('/profile/skills', { name }),
  removeSkill: (id) => api.delete(`/profile/skills/${id}`),
  endorseSkill: (profileId, skillId) => api.post(`/profile/${profileId}/skills/${skillId}/endorse`),
  addCertification: (data) => api.post('/profile/certifications', data),
  deleteCertification: (id) => api.delete(`/profile/certifications/${id}`),
  addProject: (data) => api.post('/profile/projects', data),
  deleteProject: (id) => api.delete(`/profile/projects/${id}`),
  uploadResume: (formData) => api.post('/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteResume: () => api.delete('/profile/resume'),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeAvatar: () => api.delete('/profile/avatar'),
  uploadCover: (formData) => api.post('/profile/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeCover: () => api.delete('/profile/cover'),
};

export const connectionService = {
  getMyConnections: () => api.get('/connections'),
  getPendingRequests: () => api.get('/connections/pending'),
  getSuggestions: () => api.get('/connections/suggestions'),
  getConnectionStatus: (userId) => api.get(`/connections/status/${userId}`),
  sendRequest: (userId) => api.post(`/connections/request/${userId}`),
  acceptRequest: (connectionId) => api.put(`/connections/${connectionId}/accept`),
  rejectRequest: (connectionId) => api.put(`/connections/${connectionId}/reject`),
  cancelRequest: (connectionId) => api.delete(`/connections/${connectionId}/cancel`),
  removeConnection: (userId) => api.delete(`/connections/${userId}/remove`),
};

export const postService = {
  getPosts: (params) => api.get('/posts', { params }),
  getPostById: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  repostPost: (id, data) => api.post(`/posts/${id}/repost`, data || {}),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.put(`/posts/${id}/like`),
  savePost: (id) => api.put(`/posts/${id}/save`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (id, commentId) => api.delete(`/posts/comments/${commentId}`),
};

export const articleService = {
  getArticles: (params) => api.get('/articles', { params }),
  getArticleById: (id) => api.get(`/articles/${id}`),
  createArticle: (data) => api.post('/articles', data),
  likeArticle: (id) => api.put(`/articles/${id}/like`),
  addComment: (id, content) => api.post(`/articles/${id}/comments`, { content }),
  deleteArticle: (id) => api.delete(`/articles/${id}`),
};

export const companyService = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  createCompany: (data) => api.post('/companies', data),
  followCompany: (id) => api.put(`/companies/${id}/follow`),
  getCompanyJobs: (id) => api.get(`/companies/${id}/jobs`),
};

export const jobService = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getRecommendedJobs: () => api.get('/jobs/recommendations'),
  getSavedJobs: () => api.get('/jobs/saved'),
  getMyApplications: () => api.get('/jobs/my-applications'),
  applyForJob: (id, data) => api.post(`/jobs/${id}/apply`, data),
  saveJob: (id) => api.post(`/jobs/${id}/save`),
  unsaveJob: (id) => api.delete(`/jobs/${id}/save`),
};

export const recruiterService = {
  getDashboardStats: () => api.get('/recruiter/dashboard'),
  getRecruiterJobs: () => api.get('/recruiter/jobs'),
  createJob: (data) => api.post('/recruiter/jobs', data),
  updateJob: (id, data) => api.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/recruiter/jobs/${id}`),
  getJobApplicants: (params) => api.get('/recruiter/applicants', { params }),
  updateApplicationStatus: (id, data) => api.put(`/recruiter/applications/${id}/status`, data),
  searchCandidates: (params) => api.get('/recruiter/candidates', { params }),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getMessagesWithUser: (userId) => api.get(`/messages/user/${userId}`),
  sendMessage: (data) => api.post('/messages', data),
};

export const searchService = {
  searchGlobal: (params) => api.get('/search', { params }),
};

export const uploadService = {
  uploadImage: (formData) => api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDocument: (formData) => api.post('/upload/document', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const analyticsService = {
  getMyAnalytics: () => api.get('/analytics/me'),
  recordEvent: (data) => api.post('/analytics/event', data),
};

export default api;
