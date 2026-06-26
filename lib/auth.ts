import NextAuth from "next-auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';

export const { auth, handlers, signIn, signOut } = NextAuth(async () => {
  const headersList = await headers();
  const protocol = headersList.get('x-forwarded-proto');
  const host = headersList.get('host');
  const url = protocol && host ? `${protocol}://${host}/api/auth` : null;

  if (!url) {
    console.error('Invalid request url');
    return { providers: [] };
  }
  
  return {
    callbacks: {
      redirect() {
        return `${protocol}://${host}/`;
      }
    },
    redirectProxyUrl: url,
    providers: [
      {
        id: "einfracz",
        name: "e-INFRA CZ",
        type: "oidc",
        wellKnown: process.env.AUTHORITY_PROD_CONFIG,
        issuer: process.env.AUTHORITY_PROD,
        authorization: { params: { scope: "openid email profile" } },
        checks: ["pkce", "state"],
        clientId: process.env.CLIENT_ID_PROD,
        clientSecret: process.env.CLIENT_SECRET_PROD,
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
          }
        },
      }
    ]
  }
});

export const ApiWithAuth = (handler: (req: NextRequest, ctx: any) => Promise<NextResponse|Response>) => {
  return async (req: NextRequest, ctx: any) => {
    const checkAuth = process.env.AUTHORITY_PROD !== undefined;
    if (checkAuth) {
      const session = await auth();
      if (!session) {
        return NextResponse.json(
          { message: "Login Required" },
          { status: 401 }
        );
      }
    }
    return handler(req, ctx);
  };
};