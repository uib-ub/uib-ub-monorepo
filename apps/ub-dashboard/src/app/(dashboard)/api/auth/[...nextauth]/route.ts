import NextAuth from "next-auth/next"

const handler = NextAuth({
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
  ]
})
export { handler as GET, handler as POST }