import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/inngest',
  '/api/migrate',
  '/api/test-pipeline',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.url;
      const signInUrl = new URL('/sign-in', appUrl);
      signInUrl.searchParams.set('redirect_url', new URL(request.url).pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|tiff?|bmp|svg|avi|mp4|mov|mkv|ico|cur|webm)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
