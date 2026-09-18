import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  username: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'DEVELOPER';
  password?: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (user: Omit<User, 'createdAt'>) => { success: boolean; error?: string };
  logout: () => void;
  deleteUser: (username: string) => void;
  addUser: (user: Omit<User, 'createdAt'>) => { success: boolean; error?: string };
}

const INITIAL_USERS: User[] = [
  {
    username: 'admin',
    name: 'Cheyernex Manzanillo',
    email: 'cmanzanillo@dominicana.com',
    role: 'ADMIN',
    password: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    username: 'operator',
    name: 'Operador Logístico',
    email: 'operador@orderflow.local',
    role: 'OPERATOR',
    password: 'operator',
    createdAt: new Date().toISOString(),
  },
  {
    username: 'developer',
    name: 'DevOps Engineer',
    email: 'devops@orderflow.local',
    role: 'DEVELOPER',
    password: 'dev',
    createdAt: new Date().toISOString(),
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('orderflow_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('orderflow_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to admin for seamless experience if not set
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    localStorage.setItem('orderflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('orderflow_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('orderflow_current_user');
    }
  }, [currentUser]);

  const login = (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const found = users.find((u) => u.username.toLowerCase() === trimmedUser);
    if (!found) {
      return { success: false, error: 'Usuario no encontrado.' };
    }
    if (found.password && found.password !== password) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }
    const safeUser = { ...found };
    delete safeUser.password;
    setCurrentUser(safeUser);
    return { success: true };
  };

  const register = (user: Omit<User, 'createdAt'>) => {
    const trimmedUser = user.username.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === trimmedUser)) {
      return { success: false, error: 'El nombre de usuario ya está en uso.' };
    }
    const newUser: User = {
      ...user,
      username: trimmedUser,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    const safeUser = { ...newUser };
    delete safeUser.password;
    setCurrentUser(safeUser);
    return { success: true };
  };

  const addUser = (user: Omit<User, 'createdAt'>) => {
    const trimmedUser = user.username.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === trimmedUser)) {
      return { success: false, error: 'El nombre de usuario ya está en uso.' };
    }
    const newUser: User = {
      ...user,
      username: trimmedUser,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  const deleteUser = (username: string) => {
    if (currentUser?.username === username) {
      return; // Cannot delete self
    }
    setUsers((prev) => prev.filter((u) => u.username !== username));
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, deleteUser, addUser }}>
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
