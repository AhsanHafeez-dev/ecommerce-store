'use server';

import prismadb from '@/lib/prismadb';

export async function checkUserStatus(email: string) {
    if (!email) {
        return { error: 'Email is required' };
    }

    try {
        const user = await prismadb.user.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        });

        if (!user) {
            return { exists: false, hasPassword: false };
        }

        return {
            exists: true,
            hasPassword: !!user.hashedPassword,
        };
    } catch (error) {
        console.error('Error checking user status:', error);
        return { error: 'Failed to check user status' };
    }
}

import { auth } from '@/lib/auth';

export async function getUserRole() {
    const session = await auth();
    return session?.user?.role;
}
