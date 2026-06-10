export const getToken = (): string | null => localStorage.getItem('admin_token');

export const isLoggedIn = (): boolean => !!getToken();

export const logout = (): void => {
  localStorage.removeItem('admin_token');
  window.location.href = '/admin';
};

export const authHeader = (): Record<string, string> => ({
  Authorization: `Bearer ${getToken() || ''}`,
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
});
