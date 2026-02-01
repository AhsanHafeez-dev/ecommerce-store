'use server';

import { auth } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function setPassword(formData: FormData) {
    const password = formData.get('password') as string;
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return { error: 'Not authenticated' };
    }

    if (!password || password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    try {
        const hashedPassword = await hash(password, 12);

        await prismadb.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                hashedPassword,
            },
        });

        // Re-login to update session token with hasPassword: true
        try {
            await import('@/lib/auth').then(({ signIn }) =>
                signIn('credentials', {
                    email: session.user.email,
                    password: password,
                    redirect: false
                })
            );
        } catch (error) {
            console.error('Error re-signing in:', error);
        }

    } catch (error) {
        console.error('Error setting password:', error);
        return { error: 'Failed to set password' };
    }

    redirect('/');
}
