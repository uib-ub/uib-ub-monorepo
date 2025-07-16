'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { useSearchQuery } from '@/lib/search-params';
import { useSearchParams, useRouter } from 'next/navigation';

interface GroupContextData {
    groupData: any[] | null;
    groupLoading: boolean;
    groupError: Record<string, string> | null;
    groupTotal: { value: number, relation: string } | null;
    setInitialUrl: (url: string | null) => void;
    initialUrl: string | null;
}

export const GroupContext = createContext<GroupContextData>({
    groupData: null,
    groupLoading: true,
    groupError: null,
    groupTotal: null,
    setInitialUrl: () => {},
    initialUrl: null
});

export default function GroupProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const group = searchParams.get('group')
    const [groupLoading, setGroupLoading] = useState<boolean>(true)
    const [groupError, setGroupError] = useState<Record<string, string> | null>(null)
    const [groupData, setGroupData] = useState<any[] | null>(null)
    const [groupTotal, setGroupTotal] = useState<{ value: number; relation: string } | null>(null)
    const [initialUrl, setInitialUrl] = useState<string | null>(null)
    const [initialMode, setInitialMode] = useState<string | null>(null)
    const doc = searchParams.get('doc')
    const docIndex = groupData?.findIndex(item => item.fields.uuid[0] === doc)

    const {searchQueryString } = useSearchQuery()
    const details = searchParams.get('details') || 'doc'
    const fuzzyNav = searchParams.get('fuzzyNav')

    useEffect(() => {
        if (group) {
            setGroupLoading(true)
            const url = `/api/search/group?${searchQueryString}&group=${group}`

            fetch(url).then(res => res.json()).then(data => {
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
    }, [group, searchQueryString, details])

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
        setInitialUrl,
        initialUrl
    }}>{children}</GroupContext.Provider>
}




