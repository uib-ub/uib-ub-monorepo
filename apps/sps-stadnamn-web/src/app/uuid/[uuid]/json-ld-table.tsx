import Link from 'next/link'
import { PiArrowRight } from 'react-icons/pi'
import NestedResource from './nested-resource'

interface JsonLdTableProps {
  jsonLd: Record<string, any>
}

export default async function JsonLdTable({ jsonLd }: JsonLdTableProps) {

  const getContext = async () => {
    'use server'
    const data = await fetch("https://linked.art/ns/v1/linked-art.json", {cache: 'force-cache'}).then(res => res.json()).catch(err => console.log(err))
    console.log("CONTEXT", data)
    return data
  }
  
  const context = await getContext()


  // Helper function to check if a value is a literal
  const isLiteral = (value: any): boolean => {
    return typeof value === 'string' || 
           typeof value === 'number' || 
           typeof value === 'boolean'
  }

  // Add helper function to resolve prefixed URIs
  const resolveUri = (value: string): string => {
    if (!value.includes(':')) return value
    const [prefix, local] = value.split(':')
    return jsonLd['@context']?.[prefix] ? 
      `${jsonLd['@context'][prefix]}${local}` : 
      value
  }

  // Helper function to extract UUID from either prefixed ID or full URL
  const getUuid = (id: string): string | undefined => {
    if (id.includes('/uuid/')) {
      return id.split('/uuid/')[1];
    }
    if (id.includes(':')) {
      return id.split(':').pop();
    }
    return id;
  };

  // Helper function to collect child UUIDs from a nested object
  const getChildUuids = (value: any): string[] => {
    if (!value || typeof value !== 'object') return [];
    
    const uuids: string[] = [];
    Object.values(value).forEach(v => {
      if (typeof v === 'object' && v !== null && 'id' in v) {
        const uuid = getUuid((v as { 'id': string })['id']);
        if (uuid) uuids.push(uuid);
      }
    });
    return uuids;
  };

  // Helper function to render a value (either as text or link)
  const renderValue = (value: any, property?: string, parentUuid?: string) => {
    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index}>
              {renderValue(item, property, parentUuid)}
            </div>
          ))}
        </div>
      );
    }

    // Special handling for @context
    if (property === '@context' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([prefix, uri]) => (
            <div key={prefix} className="flex items-center gap-2">
              <code lang="en">{prefix}</code>
              <span className="text-neutral-800 select-none"><PiArrowRight aria-hidden="true" /></span>
              <Link lang="en" href={uri as string}>{uri as string}</Link>
            </div>
          ))}
        </div>
      )
    }

    // Handle nested objects
    if (typeof value === 'object' && value !== null) {
      if (value['id']) {
        const currentUuid = getUuid(value['id']);
        
        if (Object.keys(value).length > 1) {
          // Get child UUIDs from nested objects
          const childUuids = getChildUuids(value);
          
          return (
            <div className="space-y-2">
              
              <NestedResource 
                uri={value['id']} 
                parentUuid={parentUuid}
                childUuids={childUuids}
              >
                <div className="pl-4 border-l-2 border-neutral-300 mt-2">
                  <table className="min-w-full bg-neutral-50 rounded-sm">
                    <tbody>
                      {Object.entries(value)
                        .filter(([k]) => k !== 'id')
                        .map(([k, v]) => (
                          <tr key={k}>
                            <td lang="en" className="px-4 py-2 border-b border-neutral-200 text-sm">
                              {k.startsWith('@') ? (
                                k
                              ) : (
                                <Link href={resolveUri(k)}>{k}</Link>
                              )}
                            </td>
                            <td className="px-4 py-2 border-b border-neutral-200 text-sm">
                              {renderValue(v, k, currentUuid)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </NestedResource>
            </div>
          )
        }
        return <Link lang="en" href={resolveUri(value['id'])}>{value['id']}</Link>
      }
      // Handle other object types (like @value/@type pairs)
      if (value['@value']) {
        return (
          <div>
            <div>{value['@value']}</div>
            {value['@type'] && (
              <div lang="en" className="text-sm text-neutral-900">
                Type: <Link href={resolveUri(value['@type'])}>{value['@type']}</Link>
              </div>
            )}
          </div>
        )
      }
      return JSON.stringify(value)
    }

    // Handle string values that are URIs or prefixed URIs
    if (typeof value === 'string' && (value.includes('://') || value.includes(':'))) {
      const resolvedUri = resolveUri(value)
      return <Link lang="en" href={resolvedUri}>{value}</Link>
    }

    if (isLiteral(value)) {
      return String(value)
    }

    return null
  }

  return (
    <div className="overflow-x-auto">
      HERE{JSON.stringify(context)}
      <table className="min-w-full">
        <thead>
          <tr lang="en">
            <th className="px-4 py-3 text-left border-b border-neutral-200">Property</th>
            <th className="px-4 py-3 text-left border-b border-neutral-200">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(jsonLd).map(([key, value]) => (
            <tr key={key}>
              <td lang="en" className="px-4 py-3 border-b border-neutral-200">
                {key.startsWith('@') ? (
                  key
                ) : (
                  <Link href={resolveUri(key)}>{key}</Link>
                )}
              </td>
              <td className="px-4 py-3 border-b border-neutral-200">
                {renderValue(value, key)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
