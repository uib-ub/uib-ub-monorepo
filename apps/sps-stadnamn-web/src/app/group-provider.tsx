'use client'
import { createContext, useContext } from 'react'
import { useState, useEffect } from 'react';
import { useMode, useSearchQuery } from '@/lib/search-params';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlobalContext } from './global-provider';
import { CollapsedContext } from './collapsed-provider';
import { base64UrlToString, stringToBase64Url } from '@/lib/utils';

interface GroupContextData {
    groupData: any[] | null;
    groupLoading: boolean;
    groupError: Record<string, string> | null;
    groupTotal: { value: number, relation: string } | null;
    prevDocUuid: string | null;
    nextDocUuid: string | null;
    docIndex: number | undefined;
    groupIndex: number | null;
    highlightedGroup: string | null;
    setHighlightedGroup: (group: string | null) => void;
}

export const GroupContext = createContext<GroupContextData>({
    groupData: null,
    groupLoading: true,
    groupError: null,
    groupTotal: null,
    prevDocUuid: null,
    nextDocUuid: null,
    docIndex: undefined,
    groupIndex: null,
    highlightedGroup: null,
    setHighlightedGroup: () => {},
});


export default function GroupProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const [groupLoading, setGroupLoading] = useState<boolean>(true)
    const [groupError, setGroupError] = useState<Record<string, string> | null>(null)
    const [groupData, setGroupData] = useState<any[] | null>(null)
    const [prevDocUuid, setPrevDocUuid] = useState<string | null>(null)
    const [nextDocUuid, setNextDocUuid] = useState<string | null>(null)
    const [groupTotal, setGroupTotal] = useState<{ value: number; relation: string } | null>(null)
    const [initialUrl, setInitialUrl] = useState<string | null>(null)
    const doc = searchParams.get('doc')
    const [docIndex, setDocIndex] = useState<number | undefined>(undefined)
    const [groupIndex, setGroupIndex] = useState<number | null>(null)
    const { collapsedResults } = useContext(CollapsedContext)
    const [highlightedGroup, setHighlightedGroup] = useState<string | null>(null) // Allows highlighting even when navigating back to url without group param
    



    const {searchQueryString } = useSearchQuery()
    const details = searchParams.get('details') || 'doc'
    const fuzzyNav = searchParams.get('fuzzyNav')
    const mode = useMode()
    const { isMobile } = useContext(GlobalContext)
    const groupPage = searchParams.get('groupPage') || '0'

    const topGroup = collapsedResults?.[0]?.fields?.['group.id']?.[0]
    const group = searchParams.get('group') || (topGroup ? stringToBase64Url(topGroup) : null)




    useEffect(() => {
        if (!doc || isMobile) return
        const currentIndex = groupData?.findIndex(item => item.fields?.uuid[0] === doc || item._source?.uuid === doc)
        if (currentIndex !== undefined && currentIndex > -1) {
            setDocIndex(currentIndex)
        }
        
    }, [doc, groupData, groupLoading, isMobile])

    useEffect(() => {
        if (!group) {
            setGroupIndex(null)
            return
        }
        const foundGroupIndex = collapsedResults?.findIndex((result: any) => result.fields?.['group.id']?.[0] == base64UrlToString(group))
        if (foundGroupIndex !== undefined && foundGroupIndex > -1) {
            setGroupIndex(foundGroupIndex)
        }
        else {
            setGroupIndex(null)
        }
      }, [group, collapsedResults])

    useEffect(() => {
        if (group) {
            setGroupLoading(true)
            setHighlightedGroup(group)
            const url = `/api/search/group?${searchQueryString}&group=${group}&mode=${isMobile ? 'list' : mode}&groupPage=${groupPage}`

            fetch(url, {cache: 'force-cache', next: {tags: ['all']}}).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setGroupData(data.hits.hits)
                    setGroupTotal(data.hits.total)
                }
            }).catch(err => {
                setGroupError(err)
            }).finally(() => {
                setGroupLoading(false)

            })
        }
        else {
            setGroupData(null)
            setGroupLoading(false)
            setGroupTotal(null)
        }
    }, [group, searchQueryString, details, mode, isMobile, groupPage])

    // Prefetch prev and next doc
    useEffect(() => {
        if (groupData && !groupLoading) {
            setPrevDocUuid((docIndex !== undefined && docIndex > 0) ? groupData[docIndex - 1]?.fields?.uuid[0] : null)
            setNextDocUuid((docIndex !== undefined && docIndex < groupData.length - 1) ? groupData[docIndex + 1]?.fields?.uuid[0] : null)
        }
    }, [groupData, docIndex, groupLoading])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the active element is a text input or textarea
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'INPUT' || 
                activeElement?.tagName === 'TEXTAREA' || 
                activeElement?.getAttribute('contenteditable') === 'true') {
                return;
            }

            
            
            if (!e.shiftKey) return;
            
            if (e.key === 'ArrowLeft') {
                if (!groupData || docIndex === undefined || docIndex === -1) return;
                e.preventDefault();
                const prevIndex = Math.max(0, docIndex - 1);
                if (prevIndex !== docIndex) {
                    const params = new URLSearchParams(searchParams);
                    params.set('doc', groupData[prevIndex].fields.uuid[0]);
                    router.push(`?${params.toString()}`);
                }
            }
            
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (!groupData || docIndex === undefined || docIndex === -1) return;
                const nextIndex = Math.min(groupData.length - 1, docIndex + 1);
                if (nextIndex !== docIndex) {
                    const params = new URLSearchParams(searchParams);
                    params.set('doc', groupData[nextIndex].fields.uuid[0]);
                    router.push(`?${params.toString()}`);
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const params = new URLSearchParams(searchParams);
                if (fuzzyNav === 'list') {
                    params.set('fuzzyNav', 'timeline');
                    router.push(`?${params.toString()}`);
                }
                else if (fuzzyNav === 'timeline') {
                    if (initialUrl) {
                        router.push(initialUrl)
                        setInitialUrl(null)
                    }
                    else {
                        params.delete('fuzzyNav');
                        params.set('details', 'doc');
                        router.push(`?${params.toString()}`);
                    }
                }
                else if (details === 'group') {
                    params.set('details', 'doc');
                    router.push(`?${params.toString()}`);
                }
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const params = new URLSearchParams(searchParams);
                
                if (!fuzzyNav && details === 'doc' && groupTotal?.value && groupTotal.value > 1) {
                    params.set('details', 'group');
                }
                else if (!fuzzyNav) {
                    params.set('fuzzyNav', 'timeline');
                    params.delete('details')
                    params.delete('doc')
                    setInitialUrl(`?${searchParams.toString()}`)

                }
                else if (fuzzyNav === 'timeline') {
                    params.set("fuzzyNav", "list")
                    
                }
                router.push(`?${params.toString()}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [groupData, docIndex, searchParams, router, details, fuzzyNav, groupTotal, initialUrl]);

    return <GroupContext.Provider value={{
        groupData,
        groupLoading,
        groupError,
        groupTotal,
        prevDocUuid,
        nextDocUuid,
        docIndex,
        groupIndex,
        highlightedGroup,
        setHighlightedGroup
    }}>{children}</GroupContext.Provider>
}




