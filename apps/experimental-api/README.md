[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# experimental-api

_uib-ub_ is testing Node API frameworks, and this is a [Moleculer](https://moleculer.services/)-based microservices project. Generated with the [Moleculer CLI](https://moleculer.services/docs/0.14/moleculer-cli.html). 

It is currently a work in progress, and is not yet ready for other than evaluation. That being said it can be used to index legacy data to the uib-ub [Elasticsearch](https://www.elastic.co/) search cluster.

## Usage

```bash
# start dev in the monorepo (open the http://localhost:3099/ URL in your browser)
npm run dev -w experimental-api
# build the production build locally
npm run build -w experimental-api
# start the production build locally
SERVICEDIR=dist/services npm run start -w experimental-api
```

On the welcome page you can test the generated services via API Gateway and check the nodes & services.

When staring the production build locally, you need to specify the service(s) you want to start.

## CLI
In the terminal, try the following commands:
- `nodes` - List all connected nodes.
- `actions` - List all registered service actions.
- `call items.list` - Call the `items.list` action.
- `call items.get --id ubb-kk-1318-0001` - Call the `items.get` action with the `id` parameter.


## Services
- **api**: API Gateway services
- **ingester**: Ingests data from the legacy API to the Elasticsearch cluster
- **items**: Item services
- **legacy**: Legacy API services SKA and WAB
- **resolve**: Resolves an ID to find the service the items belongs to


## Useful links

* Moleculer website: https://moleculer.services/
* Moleculer documentation: https://moleculer.services/docs/0.14/
* Moleculer deployment tips: https://moleculer.services/docs/0.14/deploying

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint`: Run ESLint
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose
