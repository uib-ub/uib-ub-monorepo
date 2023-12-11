import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";
declare const tables: readonly [
  {
    readonly name: "links";
    readonly columns: readonly [
      {
        readonly name: "path";
        readonly type: "string";
        readonly unique: true;
      },
      {
        readonly name: "originalURL";
        readonly type: "string";
        readonly notNull: true;
        readonly defaultValue: "";
      },
      {
        readonly name: "qr";
        readonly type: "text";
        readonly notNull: true;
        readonly defaultValue: "";
      },
      {
        readonly name: "created";
        readonly type: "datetime";
      },
      {
        readonly name: "modified";
        readonly type: "datetime";
      },
      {
        readonly name: "views";
        readonly type: "int";
        readonly notNull: true;
        readonly defaultValue: "0";
      },
      {
        readonly name: "domain";
        readonly type: "string";
        readonly notNull: true;
        readonly defaultValue: "";
      },
      {
        readonly name: "title";
        readonly type: "string";
      },
      {
        readonly name: "tags";
        readonly type: "multiple";
      },
      {
        readonly name: "expiresAt";
        readonly type: "datetime";
      },
      {
        readonly name: "expiresURL";
        readonly type: "string";
      },
      {
        readonly name: "utmSource";
        readonly type: "string";
      },
      {
        readonly name: "utmMedium";
        readonly type: "string";
      },
      {
        readonly name: "utmCampaign";
        readonly type: "string";
      },
      {
        readonly name: "utmTerm";
        readonly type: "string";
      },
      {
        readonly name: "utmContent";
        readonly type: "string";
      },
      {
        readonly name: "redirectType";
        readonly type: "int";
        readonly notNull: true;
        readonly defaultValue: "302";
      }
    ];
  }
];
export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;
export type Links = InferredTypes["links"];
export type LinksRecord = Links & XataRecord;
export type DatabaseSchema = {
  links: LinksRecord;
};
declare const DatabaseClient: any;
export declare class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions);
}
export declare const getXataClient: () => XataClient;
export {};
