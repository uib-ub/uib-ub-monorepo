# Types

Package for shared types. 

## Scripts

### Linked.Art

```bash
# Download json schemas from our fork of linked.art/json-validator and convert them to typescript types
npm run la-sync
# Only download
npm run la-download
# Only convert
npm run la-to-types
```

This will use `tiged` to get the "schemas" folder from the our for of the linked-art/linked.art repository, uib-ub/la-json-validator and copy it to the `src/la/schemas` folder of this package. The `json-schema-to-typescript` library will convert the json schemas to typescript types and save them in the `src/la/types` folder.