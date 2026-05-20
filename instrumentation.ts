export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerProcessSafetyHandlers } = await import('@/src/server/lib/process-safety')
    registerProcessSafetyHandlers()
  }
}
