import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Customer, LoginRequest, VerifyOTPRequest } from '../types/api.types';
import { authApi } from '../api/auth.api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../api/client';

export interface AuthContextType {
  user: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<{ verificationId: string; message: string }>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<Customer>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: Customer) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return (
      payload.role ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const customer = await authApi.getCurrentCustomer();
      const tokenRole = getRoleFromToken(token);
      if (tokenRole && (!customer.role || tokenRole.toLowerCase() === 'admin')) {
        customer.role = tokenRole;
      }
      setUser(customer);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('shopnest_auth_expired', handleAuthExpired);

    return () => {
      window.removeEventListener('shopnest_auth_expired', handleAuthExpired);
    };
  }, [refreshUser]);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);

    return {
      verificationId: response.verificationId,
      message: response.message,
    };
  };

  const verifyOTP = async (data: VerifyOTPRequest): Promise<Customer> => {
    const response = await authApi.verifyEmail(data);

    setTokens(response.accessToken, response.refreshToken);

    // Get the authenticated user after receiving the tokens.
    // This allows the login page to determine whether the user is an Admin or Customer.
    const customer = await authApi.getCurrentCustomer();
    const tokenRole = getRoleFromToken(response.accessToken);
    if (tokenRole && (!customer.role || tokenRole.toLowerCase() === 'admin')) {
      customer.role = tokenRole;
    }

    setUser(customer);

    return customer;
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        console.error('Logout API failed', err);
      }
    }

    clearTokens();
    setUser(null);
  };

  const updateUser = (updatedUser: Customer) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOTP,
        logout,
        refreshUser,
        updateUser,
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