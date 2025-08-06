import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: 'dataporten',
      name: 'DATAPORTEN',
      type: 'oauth',
      issuer: 'https://auth.dataporten.no',
      wellKnown: 'https://auth.dataporten.no/.well-known/openid-configuration',
      token: true,
      clientId: process.env.DATAPORTEN_ID,
      clientSecret: process.env.DATAPORTEN_SECRET,
      profile: (profile: any) => {
        return {
          ...profile,
          id: profile.sub,
          image: profile.picture,
          email: profile.email,
        };
      },
    },
  ]
})
