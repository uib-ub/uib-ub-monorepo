# Legacy ES context

This `context.ts` file is a legacy file that is used to provide a context for the legacy ES ingester datamodell.

For example `dct:subject` is not an array of `id`'s but an array of `string`'s, since the old ES index was not able to handle arrays of objects.