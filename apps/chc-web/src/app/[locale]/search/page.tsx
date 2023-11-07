"use client";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Stats,
  CurrentRefinements,
  Pagination,
  RefinementList,
} from "react-instantsearch";
import { Hit } from "@/app/[locale]/search/_components/hit";
import createClient from "@searchkit/instantsearch-client";
import "instantsearch.css/themes/reset-min.css";

const searchClient = createClient({
  url: "/api/search",
});

const facetAttributes = [
  {
    attribute: "type",
    label: "Type",
  },
  {
    attribute: "maker.label_none",
    label: "Maker",
  },
  {
    attribute: "subject.label_none",
    label: "Subject",
  },
  {
    attribute: "spatial.label_none",
    label: "Place",
  },
];

export default function SearchPage() {
  return (
    <>
      <InstantSearch
        searchClient={searchClient}
        indexName="marcus-demo"
        routing={true}
      >
        <SearchBox
          classNames={{
            form: "my-5 w-full text-lg flex flex-row items-center space-x-3 space-y-0",
            input: "dark:bg-neutral-600 grow p-2 border rounded text-current",
            submitIcon: "h-4 w-4",
            resetIcon: "h-4 w-4",
          }}
        />

        <div className="grid grid-cols-8 gap-14">
          <div className="col-span-3 flex flex-col gap-3 lg:col-span-2">
            {facetAttributes.map((facet) => (
              <div key={facet.attribute}>
                {facet.label ? (
                  <h2 className="text-sm font-semibold">{facet.label}</h2>
                ) : null}
                <RefinementList
                  attribute={facet.attribute}
                  searchable
                  classNames={{
                    label: "flex flex-row items-center space-x-3 space-y-0",
                    checkbox:
                      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                    selectedItem: "text-current",
                    labelText:
                      "text-sm grow leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-normal",
                    count:
                      "text-sm self-end inline-flex items-center border rounded-full px-1.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="col-span-5 lg:col-span-6">
            <Stats />
            <CurrentRefinements
              classNames={{
                root: "my-5",
                noRefinementRoot: "my-0",
                list: "flex flex-row gap-2",
                item: "flex gap-2 items-center",
                label: "hidden",
                category:
                  "inline-flex flex-row gap-1 items-center border rounded-full px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
                categoryLabel: "pr-2",
              }}
            />

            <Pagination
              classNames={{
                root: "my-5",
                noRefinementRoot: "my-0",
                list: "flex flex-row items-center space-x-3 space-y-0 my-5",
                item: "items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground hidden h-8 w-8 p-0 lg:flex",
                selectedItem: "bg-accent text-accent-foreground",
                disabledItem: "opacity-50 pointer-events-none",
              }}
            />
            <Hits
              hitComponent={Hit}
              classNames={{
                list: "items-start justify-center gap-6 rounded-lg p-8 columns-1 md:columns-2 lg:columns-3 2xl:columns-4",
                item: "mb-8 min-h-52",
              }}
            />
            <Pagination
              classNames={{
                root: "my-5",
                noRefinementRoot: "my-0",
                list: "flex flex-row items-center space-x-3 space-y-0 my-5",
                item: "items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground hidden h-8 w-8 p-0 lg:flex",
                selectedItem: "bg-accent text-accent-foreground",
                disabledItem: "opacity-50 pointer-events-none",
              }}
            />
          </div>
        </div>
      </InstantSearch>
    </>
  );
}
