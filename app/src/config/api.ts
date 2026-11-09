// API Configuration
const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// On a phone, localhost refers to the phone itself. Use the same LAN host as
// the Vite page so the phone can reach the backend running on the computer.
export const API_URL = isLocalBrowser
  ? configuredApiUrl
  : `${window.location.protocol}//${window.location.hostname}:5000`;

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
