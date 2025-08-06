import NextAuth from "next-auth"

// Add type declarations
declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
  interface JWT {
    profile?: {
      id: string
      name: string
      email: string
      image?: string
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: 'dataporten',
      name: 'DATAPORTEN',
      type: 'oauth',
      issuer: 'https://auth.dataporten.no',
      wellKnown: 'https://auth.dataporten.no/.well-known/openid-configuration',
      // Add explicit token endpoint
      token: 'https://auth.dataporten.no/oauth/token',
      clientId: process.env.DATAPORTEN_ID,
      clientSecret: process.env.DATAPORTEN_SECRET,
      userinfo: {
        url: 'https://auth.dataporten.no/userinfo',
        params: {
          schema: 'openid',
          scope: 'openid email profile',
        },
      },
      profile: (profile: any) => {
        // Handle the nested user structure
        const userData = profile.user || profile
        return {
          id: userData.userid || userData.sub || userData.id,
          name: userData.name,
          email: userData.email,
          image: userData.profilephoto || userData.picture || userData.avatar_url,
        };
      },
    },
  ],
  // Add these callback configurations
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (profile) {
        token.profile = profile
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      // Ensure user data is properly set
      if (token.profile) {
        const profile = token.profile as any
        const userData = profile.user || profile
        session.user = {
          id: userData.userid || userData.id,
          name: userData.name,
          email: userData.email,
          image: userData.profilephoto || userData.image,
          emailVerified: null,
        }
      }
      return session
    },
  },
  // Add proper redirect URLs
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  //debug: true,
})
