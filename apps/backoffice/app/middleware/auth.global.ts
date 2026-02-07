/**
 * @pattern Guard Pattern
 * @category Middleware
 * @purpose Route protection with JWT authentication check
 *
 * Guards all routes except /login, ensuring only authenticated users can access the backoffice
 *
 * @example
 * This middleware is applied globally via nuxt.config.ts
 * It runs before every route navigation
 */

export default defineNuxtRouteMiddleware((to, _from) => {
  // Only run on client-side (auth state is stored in localStorage)
  if (import.meta.server) {
    console.log('[auth middleware] Skipping on server-side')
    return
  }

  const { isAuthenticated } = useAuth()

  console.log(`[auth middleware] Navigating to: ${to.path}, isAuthenticated: ${isAuthenticated.value}`)

  // Special case: Login page
  if (to.path === '/login') {
    // If already authenticated, redirect to home
    if (isAuthenticated.value) {
      console.log('[auth middleware] Already authenticated, redirecting to home')
      return navigateTo('/')
    }
    // Allow access to login page
    return
  }

  // All other routes: require authentication
  if (!isAuthenticated.value) {
    console.log('[auth middleware] Not authenticated, redirecting to login')
    return navigateTo('/login')
  }

  // User is authenticated, allow navigation
  console.log('[auth middleware] Authenticated, allowing navigation')
})
