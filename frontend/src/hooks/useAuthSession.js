import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom Hook to extract and manage client-side authentication session state.
 * Consumes the reactive AuthContext provider.
 * 
 * @returns {Object} { token, user, userId, isLoggedIn, login, logout, updateUser }
 */
export function useAuthSession() {
  return useContext(AuthContext);
}

