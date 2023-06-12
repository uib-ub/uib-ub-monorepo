export default (event) => {
  // check if session exists
  if (!event.context.session) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
};
