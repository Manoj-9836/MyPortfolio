// API Configuration
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// Prefer the deployment-provided backend URL. Only use the LAN fallback for
// local development, where the frontend and backend run on the same machine.
export const API_URL = configuredApiUrl || (
  isLocalBrowser
    ? 'http://localhost:5000'
    : `${window.location.protocol}//${window.location.hostname}:5000`
);

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: `${API_URL}/api/auth`,
  PORTFOLIO: `${API_URL}/api/portfolio`,
  HEALTH: `${API_URL}/api/health`,
  PING: `${API_URL}/ping`,
};

// Helper function for API calls
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('adminToken');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(endpoint, defaultOptions);
  return response;
};

export default API_URL;
