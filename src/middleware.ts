
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const hasPassword = (req.auth?.user as any)?.hasPassword

    // Define paths to exclude from redirection
    const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
    const isPublicRoute = nextUrl.pathname === '/auth/signin' || nextUrl.pathname === '/auth/error' || nextUrl.pathname === '/auth/verify-request'
    const isSetPasswordRoute = nextUrl.pathname === '/auth/set-password'
    const isStaticAsset = nextUrl.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|json)$/) || nextUrl.pathname.startsWith('/_next')

    if (isStaticAsset || isApiAuthRoute) {
        return
    }

    if (isLoggedIn) {
        if (!hasPassword && !isSetPasswordRoute) {
            return Response.redirect(new URL('/auth/set-password', nextUrl))
        }

        // Optional: Prevent users with password from accessing set-password page again
        if (hasPassword && isSetPasswordRoute) {
            return Response.redirect(new URL('/', nextUrl))
        }
    }

    return
})

// Optionally can use config to match specific paths only for performance
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
