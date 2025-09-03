"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import * as h3 from "h3-js"
import useGroupData from "@/state/hooks/group-data"
import { useGroup } from "@/lib/param-hooks"

const overviewQuery = async (
    groupCode: string | null,
    namesScope: string,
    groupValue: string | null,
    groupDoc: any,
    namesNav: string
) => {
    if (!groupValue || !groupDoc) {
        console.log("Early return: missing group value or groupDoc")
        return []
    }

    const firstUnderscore = groupValue.indexOf('_')
    const secondUnderscore = groupValue.indexOf('_', firstUnderscore + 1)
    const groupType = groupValue.substring(0, firstUnderscore)
    const groupLocation = groupValue.substring(firstUnderscore + 1, secondUnderscore)

    let fetchedData: any[] = []

    if (namesScope === 'group') {
        const res = await fetch(`/api/group?group=${groupCode}&size=1000`)
        const data = await res.json()
        fetchedData = data.hits.hits
    } else {
        const requestBody: any = {}
        const seenNames = new Set<string>()
        const allNames: string[] = []
        const allGnidu: Set<string> = new Set()
        const allSnid: Set<string> = new Set()

        const processName = (name: string) => {
            name = name.trim().replace("-", " ")
            if (name.includes(' ')) {
                name = name.replace(/(?:^|[\s,])(vestre|nordre|[søndre|østre|austre|mellem|mellom|[Yy]tt?re)(?=\s|$)/giu, '').trim()
                name = name.replace(/([A-Z])\1+/gu, '$1')
            }
            return name
        }

        const source = groupDoc._source

        if (source?.gnidu) {
            const gnidus = Array.isArray(source.gnidu) ? source.gnidu : [source.gnidu]
            gnidus.forEach((gnidu: string) => {
                allGnidu.add(gnidu)
            })
        }

        if (source?.snid) {
            allSnid.add(source.snid)
        }

        ;['label', 'altLabels'].forEach((field: string) => {
            if (source && source[field]) {
                const labels = Array.isArray(source[field]) ? source[field] : [source[field]]
                labels.forEach((label: string) => {
                    if (label && !seenNames.has(label)) {
                        seenNames.add(label)
                        allNames.push(processName(label))
                    }
                })
            }
        })

        if (allNames.length > 0) {
            requestBody.searchTerms = [...new Set(allNames.filter(Boolean))]
        } else {
            return []
        }

        if (groupType === 'h3') {
            const neighbours = h3.gridDisk(groupLocation, 1)
            requestBody.h3 = neighbours
        }

        if (allSnid.size > 0) {
            requestBody.snid = Array.from(allSnid)
        }

        if (allGnidu.size > 0) {
            requestBody.gnidu = Array.from(allGnidu)
        }

        const res = await fetch('/api/search/fuzzy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`Failed to fetch fuzzy search results: ${res.status} ${errorText}`)
        }

        const data = await res.json()
        fetchedData = data?.hits?.hits || []
    }

    const groupMap = new Map<string, any>()

    fetchedData.forEach((result: any) => {
        const source = result._source || result.fields || {}

        if (namesNav === 'overview') {
            const groupKey = 'all-datasets'

            if (!groupMap.has(groupKey)) {
                groupMap.set(groupKey, { key: groupKey, results: [] })
            }

            groupMap.get(groupKey).results.push({
                doc: result,
                highlightedName: source.label || source.altLabels?.[0] || 'Unknown',
            })
        } else {
            const allNames = Array.from(
                new Set(
                    (source.attestations?.map((att: any) => att.label) || [])
                        .concat(source.label ? [source.label] : [])
                        .concat(source.altLabels || [])
                )
            )

            allNames.forEach((name) => {
                const nameStr = name as string
                let groupKey: string

                if (namesNav === 'timeline') {
                    const year =
                        source.attestations?.find((att: any) => att.label === nameStr)?.year ||
                        source.year ||
                        null
                    groupKey = (year || 'no-year') as string

                    if (!groupMap.has(groupKey)) {
                        groupMap.set(groupKey, { key: groupKey, year, results: [] })
                    }
                } else {
                    groupKey = nameStr
                    if (!groupMap.has(groupKey)) {
                        groupMap.set(groupKey, { key: groupKey, results: [] })
                    }
                }

                groupMap.get(groupKey).results.push({
                    doc: result,
                    highlightedName: nameStr,
                })
            })
        }
    })

    const processedGroups = Array.from(groupMap.values())

    if (namesNav === 'timeline') {
        return processedGroups.sort((a: any, b: any) => {
            if (a.year === null && b.year === null) return 0
            if (a.year === null) return 1
            if (b.year === null) return -1
            return parseInt(a.year) - parseInt(b.year)
        })
    } else {
        return processedGroups
    }
}

export default function useOverviewData() {
    const searchParams = useSearchParams()
    const namesNav = searchParams.get('namesNav') || 'overview'
    const namesScope = searchParams.get('namesScope') || 'group'
    const { groupDoc } = useGroupData()
    const { groupCode, groupValue } = useGroup()

    const { data, error, isLoading } = useQuery({
        queryKey: ['namesData', groupValue, namesScope, namesNav, groupDoc?._source?.uuid],
        queryFn: () => overviewQuery(groupCode, namesScope, groupValue, groupDoc, namesNav),
        enabled: !!groupValue && !!groupDoc,
    })

    return {
        groups: data || [],
        namesResultError: error as any,
        namesResultLoading: isLoading,
    }
}