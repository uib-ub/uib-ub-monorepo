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
}

export const GroupContext = createContext<GroupContextData>({
    groupData: null,
    groupLoading: true,
    groupError: null,
    groupTotal: null,
});

export default function GroupProvider({ children }: {  children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const group = searchParams.get('group')
    const [groupLoading, setGroupLoading] = useState<boolean>(true)
    const [groupError, setGroupError] = useState<Record<string, string> | null>(null)
    const [groupData, setGroupData] = useState<any[] | null>(null)
    const [groupTotal, setGroupTotal] = useState<{ value: number; relation: string } | null>(null)
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
            if (!groupData || docIndex === undefined || docIndex === -1) return;
            
            if (!e.shiftKey) return;
            
            if (e.key === 'ArrowLeft') {
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
                    params.delete('fuzzyNav');
                    params.set('details', 'doc');
                    router.push(`?${params.toString()}`);
                }
                else if (details === 'doc' && groupTotal?.value) {
                    params.set('details', 'group');
                    router.push(`?${params.toString()}`);
                }
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const params = new URLSearchParams(searchParams);
                if (details === 'group') {
                    params.set('details', 'doc');
                }
                else if (!fuzzyNav) {
                    params.set('fuzzyNav', 'timeline');
                }
                else {
                    params.set("fuzzyNav", "list")
                }
                router.push(`?${params.toString()}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [groupData, docIndex, searchParams, router, details, fuzzyNav, groupTotal]);

    return <GroupContext.Provider value={{
        groupData,
        groupLoading,
        groupError,
        groupTotal
    }}>{children}</GroupContext.Provider>
}




