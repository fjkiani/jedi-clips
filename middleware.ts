import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/inngest',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all non-public routes with Clerk
  if (!isPublicRoute(request)) {
    await auth.protect();
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
