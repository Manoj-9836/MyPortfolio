import { API_ENDPOINTS } from '../config/api';

export const useActivityLogger = () => {
  const token = localStorage.getItem('adminToken');

  const logActivity = async (
    action: string,
    section: string,
    type: 'create' | 'update' | 'delete' | 'view' | 'login' = 'update',
    details?: Record<string, any>
  ) => {
    try {
      await fetch(`${API_ENDPOINTS.PORTFOLIO}/activities/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          section,
          type,
          details: details || {}
        })
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};
