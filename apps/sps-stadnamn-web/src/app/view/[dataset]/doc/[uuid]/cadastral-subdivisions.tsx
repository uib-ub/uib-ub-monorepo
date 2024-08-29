
import { fetchCadastralSubunits } from "@/app/api/_utils/actions"
import { facetConfig } from "@/config/search-config"
import Link from "next/link"


export default async function CadastralSubdivisions({bnrField, sortFields, dataset, uuid}: {bnrField: string, sortFields: string[], dataset: string, uuid: string}) {

    const fields = facetConfig[dataset].filter((field: Record<string,any>) => field.table && field.key !== bnrField)

    const subdivisions = await fetchCadastralSubunits(dataset, uuid, ["uuid", "label", bnrField, ...fields.map((field: Record<string,any>) => field.key)], sortFields)

    return subdivisions.hits?.hits && (
<>

            <table className="result-table">
                <caption className="sr-only">Underordna bruk</caption>
                <thead>
                    <tr>
                        <th>Bruk</th>

                        {fields.map((field: Record<string,any>) => (
                            <th key={field.key}>{field.label}</th>
                        ))}
                    </tr>

                </thead>
                <tbody>
                    {subdivisions.hits.hits.map((hit: any) => (
                        <tr key={hit._id}>
                            <td><Link href={`/view/${dataset}/doc/${hit.fields.uuid}`}>{hit.fields[bnrField]} {hit.fields.label}</Link></td>
                            {fields.map((field: Record<string,any>) => (
                                <td key={field.key}>{hit.fields[field.key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            </>
    )
}

