import api from './api';

interface LoginResponse {
  token: string;
  user_info: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  role: 'student' | 'teacher';
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher';
}

// Login
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login/', {
      username,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Login failed' };
  }
};

// Register Student
export const registerStudent = async (userData: {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/register/', userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

// Register Teacher
export const registerTeacher = async (userData: {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  school_id: string;
}): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/register/teacher/', userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

// Store auth data
export const storeAuthData = (data: LoginResponse): void => {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userInfo', JSON.stringify(data.user_info));
  localStorage.setItem('role', data.role);
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('role');
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('userInfo');
  const role = localStorage.getItem('role') as 'student' | 'teacher' | null;
  
  if (!userStr || !role) return null;
  
  return {
    ...JSON.parse(userStr),
    role,
  };
};

// Check if authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// Get user role
export const getUserRole = (): 'student' | 'teacher' | null => {
  return localStorage.getItem('role') as 'student' | 'teacher' | null;
};
