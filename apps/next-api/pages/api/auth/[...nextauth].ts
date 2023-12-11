import NextAuth, { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'dataporten',
      name: 'DATAPORTEN',
      type: 'oauth',
      wellKnown: 'https://auth.dataporten.no/.well-known/openid-configuration',
      idToken: true,
      clientId: process.env.DATAPORTEN_ID,
      clientSecret: process.env.DATAPORTEN_SECRET,
      profile: (profile) => {
        return {
          ...profile,
          id: profile.sub,
          image: profile.picture,
          email: profile.email,
        };
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
}
export default NextAuth(authOptions)
