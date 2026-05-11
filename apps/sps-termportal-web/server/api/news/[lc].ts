export default defineEventHandler(async (event) => {
  const appConfig = useAppConfig();

  const locale = event.context.params.lc || "nb";
  const langOrder = [
    ...appConfig.language.order.update[locale],
    ...appConfig.language.order.default.filter(
      (lc: LangCode) => !appConfig.language.order.update[locale].includes(lc))].filter(
    (lc: LangCode) => appConfig.language.locale.includes(lc));

  const query = `
*[_type == "news"
  && !(_id in path("drafts.**"))
  && defined(date)
  && dateTime(date) < dateTime(now())
]{
  date,
  "title": coalesce(title${langOrder[0]}, title${langOrder[1]}, title${langOrder[2]}),
  "titleLang": select(
    defined(title${langOrder[0]}) => "${langOrder[0]}",
    defined(title${langOrder[1]}) => "${langOrder[1]}",
    "${langOrder[2]}"
  ),
  "content": coalesce(content${langOrder[0]}, content${langOrder[1]}, content${langOrder[2]}),
  "contentLang": select(
      defined(content${langOrder[0]}) => "${langOrder[0]}",
      defined(content${langOrder[1]}) => "${langOrder[1]}",
      "${langOrder[2]}"
  )
} | order(date desc)[0...3]
`;

  try {
    const sanity = useSanity();
    return await sanity.fetch(query);
  }
  catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
});
