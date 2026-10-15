import { toast } from 'sonner'

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}

export function showSuccessToast(message: string) {
  toast.success(message)
}

export function showErrorToast(error: unknown, fallback: string = 'Operation failed') {
  toast.error(getErrorMessage(error, fallback))
}

export async function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error: string
  },
) {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: (error) => getErrorMessage(error, messages.error),
  })

  return await promise
}
