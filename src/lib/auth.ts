import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Dynamic imports keep mongoose out of edge runtime
        const { default: connectDB } = await import('./db');
        const { default: User } = await import('./models/User');

        await connectDB();
        const user = await User.findOne({ email: credentials.email, isActive: true });

        if (!user) return null;

        const isValid = await user.comparePassword(credentials.password as string);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          centerId: user.centerId,
          centerName: user.centerName,
        };
      },
    }),
  ],
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
