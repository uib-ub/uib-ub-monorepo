import { NuxtAuthHandler } from "#auth";
const runtimeConfig = useRuntimeConfig();

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth.secret,
  providers: [
    {
      id: "dataporten",
      name: "DATAPORTEN",
      type: "oauth",
      wellKnown: "https://auth.dataporten.no/.well-known/openid-configuration",
      idToken: true,
      clientId: runtimeConfig.dataportenClientId,
      clientSecret: runtimeConfig.dataportenClientSecret,
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
});
