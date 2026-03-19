"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function AdminLoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: "/admin",
    })

    setIsLoading(false)

    if (result?.error) {
      setError("Invalid username or password.")
      return
    }

    window.location.href = result?.url || "/admin"
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-[#141414] shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#101010] p-10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.12),transparent_30%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/80">
                  SKF Admin
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                  Control room for the academy platform.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
                  This area is restricted to administrators and instructors. All
                  admin routes stay private and are blocked from search engines.
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                <p className="text-sm font-medium text-white/80">
                  Access includes
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/55">
                  <li>Student records and profile management</li>
                  <li>Tournament and results administration</li>
                  <li>Protected academy operations</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/80">
                Secure Sign In
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Admin Login
              </h2>
              <p className="mt-3 text-sm text-white/55">
                Use your assigned academy credentials to continue.
              </p>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-white/40"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    className="min-h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/20"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-white/40"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="min-h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/20"
                    placeholder="Enter password"
                  />
                </div>

                {error ? (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="min-h-11 w-full rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <a
                href="/"
                className="mt-6 inline-flex text-sm text-white/40 transition hover:text-white/70"
              >
                Back to website
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
