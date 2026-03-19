import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch(`${API_BASE_URL}/api/auth/me`, { 
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    })
    .then(data => {
      if (data.user) {
        setUser(data.user);
      }
    })
    .catch(() => {
      setUser(null); // Ensure user is null if fetch fails
    })
    .finally(() => setLoading(false));
}, []);
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
