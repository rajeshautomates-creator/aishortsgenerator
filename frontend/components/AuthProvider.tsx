'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/lib/api';

interface AuthContextType {
    isAdmin: boolean;
    isLoading: boolean;
    login: (password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAdmin(false);
                setIsLoading(false);
                if (pathname !== '/') {
                    router.push('/');
                }
                return;
            }

            try {
                await authApi.verify();
                setIsAdmin(true);
            } catch (error) {
                localStorage.removeItem('token');
                setIsAdmin(false);
                if (pathname !== '/') {
                    router.push('/');
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [pathname, router]);

    const login = async (password: string) => {
        await authApi.login(password);
        setIsAdmin(true);
        router.push('/dashboard');
    };

    const logout = () => {
        authApi.logout();
        setIsAdmin(false);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
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
