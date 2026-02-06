/**
 * @pattern Singleton Pattern
 * @category Plugin
 * @purpose Initialize authentication state on app startup
 *
 * This plugin runs once when the app loads on the client-side.
 * It checks for a stored JWT token in localStorage and attempts to
 * restore the user session.
 *
 * Pattern: Template Method Pattern - defines app initialization workflow
 */

export default defineNuxtPlugin(async () => {
  console.log('[auth plugin] Initializing authentication')

  const { initAuth } = useAuth()

  try {
    // Restore auth state from localStorage
    await initAuth()
    console.log('[auth plugin] Authentication initialized')
  } catch (error) {
    console.error('[auth plugin] Failed to initialize auth:', error)
  }
})
