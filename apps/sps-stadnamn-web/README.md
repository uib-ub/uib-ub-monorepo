# Stadnamnportalen
Frontend and REST API for Språksamlingane's place name collections.

Leaflet implementation based on [next-leaflet-starter](https://github.com/colbyfayock/next-leaflet-starter)

Data for elasticsearch:
https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive


IIIF-data:
https://git.app.uib.no/spraksamlingane/stadnamn/iiif.spraksamlingane.no



## Main libraries used
* State management: [nuqs](https://nuqs.47ng.com/docs) (manages state in the url)
* Map: [leaflet](https://leafletjs.com/) through [react-leaflet](https://react-leaflet.js.org/)
* Image viewer: [open seadragon](https://openseadragon.github.io/)
* Some of the UI components: [radix-ui](https://www.radix-ui.com/) (components copied from [shadcn](https://ui.shadcn.com/))


## Environment variables

The following environment variables are used in the application:

```bash
SN_ENV=local
#ES_ENDPOINT=https://search.ub.uib.no/
#ES_TOKEN=
ES_ENDPOINT=https://search.testdu.uib.no/search/ # Comment out when testing fallback
ES_TOKEN=
ES_ENDPOINT_TEST=https://search.testdu.uib.no/search/
ES_TOKEN_TEST=

```
Note that the test and production endpoints should be the same locally unless you are testing the fallback mechanism,
as indices created for local development (without pushing changes and running the cicd pipeline in stadnamn-archive) will not be available in the production cluster.
When SN_ENV is defined as prod in the vercel deployment, the test enpoint will serve as fallback.
Preview deployments will use the production endpoint.


