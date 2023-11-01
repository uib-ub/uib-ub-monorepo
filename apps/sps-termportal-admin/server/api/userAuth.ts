import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  // get authorized users from env
  const authorizedUsers = runtimeConfig.dataportenAuthorizedUsers;
  // use auth js function to get session
  const session = await getServerSession(event);
  if (session && authorizedUsers.includes(session?.user?.email || "")) {
    return true;
  } else {
    return false;
  }
});
