# Stadnamportalen


## Repos in git.app.uib.no
Data for elasticsearch:
https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive


IIIF-data:
https://git.app.uib.no/spraksamlingane/stadnamn/iiif.spraksamlingane.no



## Develop locally



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
In preview deployments, the test endpoint will be used as the primary endpoint, while the production endpoint will serve as fallback.
