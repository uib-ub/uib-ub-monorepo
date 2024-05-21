export const chc = {
  id: "chc",
  version: 1,
  description: "Marcus-next pipeline",
  /* processors: [
    {
      script: {
        lang: "painless",
        source: "if (ctx.containsKey('spatial') && ctx.spatial != null) { for (def i = 0; i < ctx.spatial.size(); i++) { def obj = ctx.spatial[i]; if (obj.lat != null && obj.long != null) { if (!ctx.containsKey('coordinates')) { ctx.coordinates = [] } ctx.coordinates.add([obj.lat, obj.long]) } } }",
        ignore_failure: true
      }
    }
  ] */
}