import NextAuth from "next-auth";
import { NextRequest, NextResponse } from 'next/server';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
     {
        id: "einfracz",
        name: "e-INFRA CZ",
        type: "oidc",
        wellKnown: process.env.NEXT_PUBLIC_AUTHORITY_PROD_CONFIG,
	issuer: process.env.NEXT_PUBLIC_AUTHORITY_PROD,
        authorization: { params: { scope: "openid email profile" } },
        checks: ["pkce", "state"],
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID_PROD,
        clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET_PROD,
        profile(profile) {
           return {
               id: profile.sub,
               name: profile.name,
               email: profile.email,
           }
        },
     }
  ]
});

export const ApiWithAuth = (handler: (req: NextRequest) => Promise<NextResponse|Response>) => {
  return async (req: NextRequest) => {
    const checkAuth = process.env.NEXT_PUBLIC_AUTHORITY_PROD !== undefined;
    if (checkAuth) {
      const session = await auth();
      if (!session) {
        return NextResponse.json(
          { message: "Login Required" },
          { status: 401 }
        );
      }
    }
    return handler(req);
  };
};
