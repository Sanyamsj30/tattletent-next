import { useMemo } from "react";

/**
 * Custom Hook to extract and manage client-side authentication session state.
 * Encapsulates sessionStorage lookups and fallback user ID checks consistently.
 * 
 * @returns {Object} { token, user, userId, isLoggedIn }
 */
export function useAuthSession() {
  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");
  
  const user = useMemo(() => {
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Failed to parse user session storage:", e);
      return null;
    }
  }, [userStr]);

  const userId = useMemo(() => {
    return user?.user_id || user?.id || user?._id || null;
  }, [user]);

  const isLoggedIn = useMemo(() => {
    return !!(token && user);
  }, [token, user]);

  return { token, user, userId, isLoggedIn };
}
