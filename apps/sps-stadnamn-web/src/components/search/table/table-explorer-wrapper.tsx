'use client'
import dynamic from "next/dynamic";

const DynamicTableExplorer = dynamic(() => import("@/components/search/table/table-explorer"), {
  ssr: false,
  loading: () => <div className="p-4">Laster tabell...</div>,
});


export default function TableExplorerWrapper() {
  return <DynamicTableExplorer />
}