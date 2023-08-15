# Types

Package for shared types. 

## Scripts

```bash
# Sync json schemas from linked.art
npm run la-sync
```

This will use `tiged` to get the "schemas" folder from the linked-art/linked.art repository and copy it to the `src/la-schemas` folder of this package. The `json2ts` will convert the json schemas to typescript types and save them in the `src/la-types` folder.