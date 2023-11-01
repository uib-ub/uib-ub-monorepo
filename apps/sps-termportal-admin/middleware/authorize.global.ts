export default defineNuxtRouteMiddleware(async () => {
  const { status, signIn } = useAuth();

  // Only check authorization if user is authenticated
  if (status.value === "authenticated") {
    // headers are necessary for SSR
    const headers = useRequestHeaders(["cookie"]) as HeadersInit;
    const { data: userIsAuthorized } = await useFetch("/api/userAuth", {
      headers,
    });

    // redirect to signIn when unauthorized
    if (!userIsAuthorized.value) {
      // use nuxt auths setup for callback handling
      const signInOptions = {
        error: "User unauthorized",
        callbackUrl: "/",
      };
      // @ts-ignore This is valid for a backend-type of `authjs`, where sign-in accepts a provider as a first argument
      return signIn(undefined, signInOptions);
    }
  }
  return;
});
