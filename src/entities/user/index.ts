export type { Profile, User, Member } from './model/types';
import type { Profile } from './model/types';

export function logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('currentUser');
}

export function getCurrentUser(): Profile | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}

export function isAdmin(user: Profile | null): boolean {
    return user?.role === 'admin';
}


export function verifyEmail(email: string, token: string): boolean {
    return true;
}