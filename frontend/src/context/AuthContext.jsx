import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const verifyUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { 
        credentials: 'include' 
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const data = await res.json();
      
      // DEBUG: Log this to see what your backend actually sends!
      console.log("Auth Data:", data);

      // Check if data is the user object itself or nested under .user
      const userData = data.user || data; 
      
      if (userData && (userData.id || userData._id)) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      // Ensure this only happens AFTER we know the user status
      setLoading(false);
    }
  };

  verifyUser();
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
