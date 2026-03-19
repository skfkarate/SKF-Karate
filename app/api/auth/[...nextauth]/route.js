import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

function buildUser({ id, name, role }) {
  return { id, name, role }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
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
            id: "admin-1",
            name: "Admin",
            role: "admin",
          })
        }

        if (
          credentials.username === process.env.INSTRUCTOR_USERNAME &&
          credentials.password === process.env.INSTRUCTOR_PASSWORD
        ) {
          return buildUser({
            id: "instructor-1",
            name: "Instructor",
            role: "instructor",
          })
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
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
        session.user.id = token.id
        session.user.role = token.role
      }

      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
