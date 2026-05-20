"use client"

import { useEffect } from "react"

type ClientErrorSource = "error_boundary" | "window_error" | "unhandled_rejection" | "client_fetch_error"

type ClientErrorPayload = {
  source: ClientErrorSource
  name?: string
  message: string
  stack?: string
  digest?: string
  path?: string
}

const DEDUPE_WINDOW_MS = 60_000
const sentAtByKey = new Map<string, number>()

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message || "Unknown client error",
      stack: error.stack,
    }
  }

  let message = "Unknown client error"
  if (typeof error === "string" && error.trim()) {
    message = error
  } else {
    try {
      message = JSON.stringify(error) || message
    } catch {
      message = String(error || message)
    }
  }

  return {
    name: "ClientError",
    message,
  }
}

export function reportClientError(input: ClientErrorPayload) {
  if (typeof window === "undefined") return

  const path = input.path || `${window.location.pathname}${window.location.search}`
  const key = [input.source, input.name || "", input.message, path].join("|")
  const now = Date.now()
  const lastSentAt = sentAtByKey.get(key) || 0
  if (now - lastSentAt < DEDUPE_WINDOW_MS) return
  sentAtByKey.set(key, now)

  const payload = {
    ...input,
    path,
    stack: input.stack?.slice(0, 4000),
  }

  void fetch("/api/system/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => null)
}

export default function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const normalized = normalizeError(event.error || event.message)
      reportClientError({
        source: "window_error",
        ...normalized,
      })
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const normalized = normalizeError(event.reason)
      reportClientError({
        source: "unhandled_rejection",
        ...normalized,
      })
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandledRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  return null
}
