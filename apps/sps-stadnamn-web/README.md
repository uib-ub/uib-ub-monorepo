# Stadnamnportalen
Frontend and REST API for Språksamlingane's place name collections.

Leaflet implementation based on [next-leaflet-starter](https://github.com/colbyfayock/next-leaflet-starter)

Data for elasticsearch:
https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive


IIIF-data:
https://git.app.uib.no/spraksamlingane/stadnamn/iiif.spraksamlingane.no



## Main libraries used
* Map: [leaflet](https://leafletjs.com/) through [react-leaflet](https://react-leaflet.js.org/)
* Image viewer: [open seadragon](https://openseadragon.github.io/)
* Some of the UI components: [radix-ui](https://www.radix-ui.com/) (components copied from [shadcn](https://ui.shadcn.com/))


## Environment variables

The following environment variables are used in the application:

* SN_ENV
    - local: for the local deveopment environment
    - dev: for the more stable dev deployment
    - prod: production
* STADNAMN_ES_ENDPOINT: the elasticsearch endpoint. Find the current one in vercel. Development versions may use a different cluster.
* STADNAMN_ES_TOKEN: find it in vercel, or create a new API key in elasticsearch

Define the variables in apps/sps-stadnamn-web/.env.local

Copy the tokens from environment variables in the [stadnamnportalen vercel project](https://vercel.com/uib-ub/stadnamnportalen/settings/environment-variabless).



## Ignore build step
Prevent vercel deployments on branches that do not match `sps/*` or `stadnamn/*`:
```bash
if [[ "$VERCEL_GIT_COMMIT_REF" =~ .*/.* ]] && ! [[ "$VERCEL_GIT_COMMIT_REF" =~ .*(sps|stadnamn)/.* ]] ; then echo "- Tag not matched, build cancelled"; exit 0; else echo "- Build can proceed, calling turbo-ignore"; npx turbo-ignore; fi
```