import axios from 'axios';
import config from '../config/environment';

// Use dynamic configuration from environment
const API_BASE_URL = config.api.baseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle actual 401 responses from the server, not network errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register/home page
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' && 
          window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  signin: async (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => {
    const response = await api.post('/auth/signin', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  signout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// User API (example for future)
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  }
};

// Feed API
export const feedAPI = {
  getFeed: async () => {
    const response = await api.get('/feed');
    return response.data;
  }
};

// Events API
export const eventsAPI = {
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  getMyEvents: async () => {
    const response = await api.get('/events/my');
    return response.data;
  },

  requestJoin: async (eventId: string) => {
    const response = await api.post(`/events/${eventId}/request-join`);
    return response.data;
  },

  cancelJoinRequest: async (eventId: string) => {
    const response = await api.delete(`/events/${eventId}/request-join`);
    return response.data;
  },

  getJoinRequests: async (eventId: string) => {
    const response = await api.get(`/events/${eventId}/join-requests`);
    return response.data;
  },

  approveJoinRequest: async (eventId: string, userId: string) => {
    const response = await api.post(`/events/${eventId}/approve/${userId}`);
    return response.data;
  },

  rejectJoinRequest: async (eventId: string, userId: string) => {
    const response = await api.post(`/events/${eventId}/reject/${userId}`);
    return response.data;
  }
};

// Teams API
export const teamsAPI = {
  getAll: async (sport?: string) => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    const response = await api.get(`/teams?${params.toString()}`);
    return response.data;
  },

  getMy: async () => {
    const response = await api.get('/teams/my');
    return response.data;
  },

  create: async (data: {
    name: string;
    sport: string;
    description?: string;
    location?: string;
    maxMembers: number;
    isPublic: boolean;
  }) => {
    const response = await api.post('/teams', data);
    return response.data;
  },

  requestJoin: async (teamId: string) => {
    const response = await api.post(`/teams/${teamId}/request-join`);
    return response.data;
  },

  cancelJoinRequest: async (teamId: string) => {
    const response = await api.delete(`/teams/${teamId}/request-join`);
    return response.data;
  },

  getJoinRequests: async (teamId: string) => {
    const response = await api.get(`/teams/${teamId}/join-requests`);
    return response.data;
  },

  approveJoinRequest: async (teamId: string, userId: string) => {
    const response = await api.post(`/teams/${teamId}/approve/${userId}`);
    return response.data;
  },

  rejectJoinRequest: async (teamId: string, userId: string) => {
    const response = await api.post(`/teams/${teamId}/reject/${userId}`);
    return response.data;
  },

  leave: async (teamId: string) => {
    const response = await api.post(`/teams/${teamId}/leave`);
    return response.data;
  }
};

// Tournaments API
export const tournamentsAPI = {
  getAll: async (sport?: string, status?: string) => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (status) params.append('status', status);
    const response = await api.get(`/tournaments?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  getMy: async () => {
    const response = await api.get('/tournaments/my');
    return response.data;
  },

  getJoined: async () => {
    const response = await api.get('/tournaments/joined');
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    sport: string;
    format: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    startDate?: string;
    endDate?: string;
    maxParticipants?: number;
    prizePot?: number;
    prizeDistribution?: string;
    isPublic?: boolean;
  }) => {
    const response = await api.post('/tournaments', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/tournaments/${id}`, data);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.post(`/tournaments/${id}/publish`);
    return response.data;
  },

  join: async (id: string) => {
    const response = await api.post(`/tournaments/${id}/join`);
    return response.data;
  },

  leave: async (id: string) => {
    const response = await api.post(`/tournaments/${id}/leave`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  }
};

// Map API
export const mapAPI = {
  getHotspots: async (sport?: string, minActivity?: number) => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (minActivity) params.append('minActivity', minActivity.toString());
    const response = await api.get(`/map/hotspots?${params.toString()}`);
    return response.data;
  },

  getHotspot: async (id: string) => {
    const response = await api.get(`/map/hotspots/${id}`);
    return response.data;
  },

  setHeading: async (locationId: string) => {
    const response = await api.post(`/map/heading/${locationId}`);
    return response.data;
  },

  confirmArrival: async (locationId: string) => {
    const response = await api.post(`/map/arrived/${locationId}`);
    return response.data;
  },

  confirmDeparture: async (locationId: string) => {
    const response = await api.post(`/map/left/${locationId}`);
    return response.data;
  }
};

// Bookings API
export const bookingsAPI = {
  getVenues: async (sport?: string, location?: string) => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (location) params.append('location', location);
    const response = await api.get(`/bookings/venues?${params.toString()}`);
    return response.data;
  },

  getVenueAvailability: async (venueId: string, date: string) => {
    const response = await api.get(`/bookings/venues/${venueId}/availability?date=${date}`);
    return response.data;
  },

  createBooking: async (data: {
    venueId: string;
    date: string;
    timeSlot: string;
    duration: number;
    sport?: string;
    notes?: string;
  }) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  cancelBooking: async (bookingId: string) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  }
};

// Stats API
export const statsAPI = {
  getMyStats: async () => {
    const response = await api.get('/stats/me');
    return response.data;
  },

  getUserStats: async (userId: string) => {
    const response = await api.get(`/stats/user/${userId}`);
    return response.data;
  },

  getUserStatsBySport: async (userId: string, sport: string) => {
    const response = await api.get(`/stats/user/${userId}/${sport}`);
    return response.data;
  }
};

export default api;