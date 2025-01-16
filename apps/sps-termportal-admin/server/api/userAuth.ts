import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  // get authorized users from env
  const authorizedUsers = runtimeConfig.dataportenAuthorizedUsers.split(", ");
  // use auth js function to get session
  const session = await getServerSession(event);
  if (
    session &&
    session?.user?.email &&
    authorizedUsers &&
    authorizedUsers.includes(session?.user?.email)
  ) {
    return true;
  } else {
    return false;
  }
});
