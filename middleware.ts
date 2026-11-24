import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/companions',
  '/subscription',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Enforce default-deny: automatically protect all routes unless explicitly public
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // If a logged-in user visits the landing page (/), immediately redirect to /companions
  if (userId && req.nextUrl.pathname === '/' && !req.nextUrl.search.includes('clerk')) {
    const companionsUrl = new URL('/companions', req.url);
    return NextResponse.redirect(companionsUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
