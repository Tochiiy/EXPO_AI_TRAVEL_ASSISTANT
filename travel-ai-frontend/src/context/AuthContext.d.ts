import React, { type ReactNode } from 'react';
interface AuthContextType {
    token: string | null;
    user: any | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}
export declare const AuthContext: React.Context<AuthContextType | null>;
export declare const AuthProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export {};
