import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData - let axios handle it automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Handle response errors - especially token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      const errorMessage = error.response?.data?.error || 'Token is not valid';
      if (errorMessage.includes('Token is not valid') || errorMessage.includes('authorization denied')) {
        // Clear invalid token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Tournament API
export const tournamentAPI = {
  getAll: (params) => api.get("/tournaments", { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  register: (id) => api.post(`/tournaments/${id}/register`),
  getMyRegistrations: () =>
    api.get("/tournament-registrations/my-registrations"),
};

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

// Payments API (for accountant)
export const paymentsAPI = {
  getAll: () => api.get("/payments"),
  updateStatus: (userId, status) =>
    api.put(`/payments/${userId}/status`, { status }),
};

// Teams API
export const teamsAPI = {
  create: (data) => api.post("/teams", data),
  getMyTeams: () => api.get("/teams/my-teams"),
  getTeam: (id) => api.get(`/teams/${id}`),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
};

// User API
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  getCurrentUser: () => api.get("/users/me"),
  getLeaderboard: (limit = 10) =>
    api.get(`/users/leaderboard/top?limit=${limit}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
};

export default api;
