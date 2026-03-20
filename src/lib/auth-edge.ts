import NextAuth from 'next-auth';

// Lightweight NextAuth config with no DB imports — safe for Edge runtime (middleware).
// The full auth config (with Credentials + DB) lives in src/lib/auth.ts.
export const { auth } = NextAuth({
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.centerId = (user as { centerId?: string }).centerId;
        token.centerName = (user as { centerName?: string }).centerName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.centerId = token.centerId as string;
        session.user.centerName = token.centerName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
