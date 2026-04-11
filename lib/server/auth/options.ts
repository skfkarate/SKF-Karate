import type { AuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

interface AuthUser extends User {
  id: string
  role: string
}

function buildUser({
  id,
  name,
  role,
}: {
  id: string
  name: string
  role: string
}): AuthUser {
  return { id, name, role }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return buildUser({
            id: 'admin-1',
            name: 'Admin',
            role: 'admin',
          })
        }

        if (
          credentials.username === process.env.INSTRUCTOR_USERNAME &&
          credentials.password === process.env.INSTRUCTOR_PASSWORD
        ) {
          return buildUser({
            id: 'instructor-1',
            name: 'Instructor',
            role: 'instructor',
          })
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === 'string') {
          session.user.id = token.id
        }

        if (typeof token.role === 'string') {
          session.user.role = token.role
        }
      }

      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
