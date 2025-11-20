
import { getCurrentUserProfile } from "./getCurrentUser";

export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUserProfile();
    return user?.role === 'admin';
}

export async function isVerified(): Promise<boolean> {
    const user = await getCurrentUserProfile();
    return user?.email_verified === true;
}

export async function isActiveUser(): Promise<boolean> {
    const user = await getCurrentUserProfile();
    return user?.status === 'active';
}
