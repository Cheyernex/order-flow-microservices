import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  loginKeycloakApi,
  parseJwtPayload,
  registerApi,
  fetchUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  UserAccount,
  KEYCLOAK_BASE,
} from 'src/api/microservices';

export interface User {
  id?: number;
  username: string;
  name: string;
  email: string;
  department?: string;
  role: 'ADMIN' | 'OPERATOR' | 'DEVELOPER' | 'MANAGER';
  active?: boolean;
  createdAt?: string;
  authProvider?: 'KEYCLOAK' | 'DATABASE';
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  token: string | null;
  loading: boolean;
  keycloakUrl: string;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (user: { username: string; password: string; name: string; email: string; department?: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteUser: (username: string) => Promise<{ success: boolean; error?: string }>;
  addUser: (user: { username: string; password: string; name: string; email: string; department?: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (username: string, user: { name: string; email: string; department?: string; role?: string; active?: boolean; password?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('orderflow_current_user');
    return saved ? JSON.parse(saved) : {
      username: 'admin',
      name: 'Cheyernex Manzanillo',
      email: 'cheyernex@gmail.com',
      role: 'ADMIN',
      authProvider: 'KEYCLOAK',
    };
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('orderflow_jwt_token'));
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const keycloakUrl = `${KEYCLOAK_BASE}/admin`;

  const mapAccountToUser = (acc: UserAccount): User => ({
    id: acc.id,
    username: acc.username,
    name: acc.fullName,
    email: acc.email,
    department: acc.department,
    role: acc.role,
    active: acc.active,
    createdAt: acc.createdAt,
    authProvider: 'DATABASE',
  });

  const refreshUsers = useCallback(async () => {
    try {
      const data = await fetchUsersApi();
      setUsers(data.map(mapAccountToUser));
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('orderflow_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('orderflow_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('orderflow_jwt_token', token);
    } else {
      localStorage.removeItem('orderflow_jwt_token');
    }
  }, [token]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);

      // 1. Intentar autenticación con Keycloak IdP
      try {
        const kcRes = await loginKeycloakApi({ username, password });
        const claims = parseJwtPayload(kcRes.access_token);
        if (claims) {
          const roles = claims.realm_access?.roles || [];
          let detectedRole: 'ADMIN' | 'OPERATOR' | 'DEVELOPER' | 'MANAGER' = 'OPERATOR';
          if (roles.includes('ADMIN')) detectedRole = 'ADMIN';
          else if (roles.includes('DEVELOPER')) detectedRole = 'DEVELOPER';
          else if (roles.includes('MANAGER')) detectedRole = 'MANAGER';

          const kcUser: User = {
            username: claims.preferred_username || username,
            name: claims.name || (claims.given_name ? `${claims.given_name} ${claims.family_name || ''}`.trim() : 'Cheyernex Manzanillo'),
            email: claims.email || 'cheyernex@gmail.com',
            department: (claims.department && claims.department[0]) || 'Tecnología / DevOps',
            role: detectedRole,
            active: true,
            authProvider: 'KEYCLOAK',
          };

          setCurrentUser(kcUser);
          setToken(kcRes.access_token);
          await refreshUsers();
          return { success: true };
        }
      } catch (kcErr: any) {
        console.warn('Keycloak auth attempted, trying internal auth fallback:', kcErr.message);
      }

      // 2. Fallback a auth-service (Spring Security & PostgreSQL)
      const res = await loginApi({ username, password });
      const user = mapAccountToUser(res.user);
      user.authProvider = 'DATABASE';
      setCurrentUser(user);
      setToken(res.token);
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
  }) => {
    try {
      setLoading(true);
      const res = await registerApi({
        username: userData.username,
        password: userData.password,
        fullName: userData.name,
        email: userData.email,
        department: userData.department,
        role: userData.role,
      });
      const user = mapAccountToUser(res);
      setCurrentUser(user);
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrar usuario' };
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
  }) => {
    try {
      await createUserApi({
        username: userData.username,
        password: userData.password,
        fullName: userData.name,
        email: userData.email,
        department: userData.department,
        role: userData.role,
      });
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al crear usuario' };
    }
  };

  const updateUser = async (
    username: string,
    userData: {
      name: string;
      email: string;
      department?: string;
      role?: string;
      active?: boolean;
      password?: string;
    }
  ) => {
    try {
      const updated = await updateUserApi(username, {
        fullName: userData.name,
        email: userData.email,
        department: userData.department,
        role: userData.role,
        active: userData.active,
        password: userData.password,
      });
      if (currentUser?.username === username) {
        setCurrentUser(mapAccountToUser(updated));
      }
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar usuario' };
    }
  };

  const deleteUser = async (username: string) => {
    if (currentUser?.username === username) {
      return { success: false, error: 'No puedes eliminar tu propia cuenta activa.' };
    }
    try {
      await deleteUserApi(username);
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar usuario' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        token,
        loading,
        keycloakUrl,
        login,
        register,
        logout,
        deleteUser,
        addUser,
        updateUser,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
