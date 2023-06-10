export default (event) => {
  if (!event.context.session) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
};
