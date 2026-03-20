import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      centerId?: string;
      centerName?: string;
    };
  }

  interface User {
    id: string;
    role?: string;
    centerId?: string;
    centerName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    centerId?: string;
    centerName?: string;
  }
}
