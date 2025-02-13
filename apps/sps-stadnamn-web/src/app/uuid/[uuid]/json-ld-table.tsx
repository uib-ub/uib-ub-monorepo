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
    return data?.["@context"] || {}
  }
  
  let context = await getContext()
  if (Array.isArray(jsonLd["@context"])) {
    context = {
      ...context,
      ...jsonLd["@context"][1]
    }
  }



  // Helper function to check if a value is a literal
  const isLiteral = (value: any): boolean => {
    return typeof value === 'string' || 
           typeof value === 'number' || 
           typeof value === 'boolean'
  }

  // Helper function to resolve URIs using context
  const resolveUri = (value: string): string => {
    // If it's already a full URI, return as is
    if (value.startsWith('http')) return value

    if (value.startsWith('@')) return value

    
    // If it's a prefixed value (e.g. crm:E1)
    if (value.includes(':')) {
      const [prefix, local] = value.split(':')
      return resolveUri(context[prefix]) + local
    }
    
    
    // Resolve value
    if (context?.[value]) {
      const contextValue = context[value]
      if (typeof contextValue === 'string') {
        return contextValue
      }
      if (typeof contextValue === 'object' && '@id' in contextValue) {
        return resolveUri(contextValue['@id'])
      }
    }
    
    return value
  }

  // Helper function to extract UUID from URI
  const getUuid = (uri: string): string | undefined => {
    const match = uri.match(/\/uuid\/([^/#]+)/)
    return match ? match[1] : undefined
  }

  // Helper function to get parent UUID from current pathname
  const getParentUuid = (uri: string): string | undefined => {
    const baseUuid = getUuid(uri)
    if (!baseUuid) return undefined
    
    const parentMatch = uri.match(/\/uuid\/([^/#]+)#/)
    return parentMatch ? parentMatch[1] : undefined
  }

  // Helper function to collect child UUIDs from a nested object
  const getChildUuids = (value: any): string[] => {
    if (!value || typeof value !== 'object') return []
    
    const uuids: string[] = []
    Object.values(value).forEach(v => {
      if (typeof v === 'object' && v !== null && 'id' in v) {
        const uuid = getUuid((v as { id: string }).id)
        if (uuid) uuids.push(uuid)
      }
    })
    return uuids
  }

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
          {Object.entries(value).map(([prefix, uri], index) => (
            <div key={index} className="flex items-center gap-2">
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
        const uuid = getUuid(value['id'])
        const currentParentUuid = parentUuid || getParentUuid(value['id'])
        
        if (Object.keys(value).length > 1) {
          const childUuids = getChildUuids(value)
          
          return (
            <div className="space-y-2" key={value['id']}>
              <NestedResource 
                key={value['id']}
                uri={value['id']} 
                parentUuid={currentParentUuid}
                childUuids={childUuids}
              >
                <div className="pl-4 border-l-2 border-neutral-300 mt-2">
                  <table className="min-w-full bg-neutral-50 rounded-sm">
                    <tbody>
                      {Object.keys(value)
                        .filter(k => k !== 'id')
                        .map(k => (
                          <tr key={`${value['id']}-${k}`}>
                            <td lang="en" className="px-4 py-2 border-b border-neutral-200 text-sm">
                              <PropertyRenderer uri={resolveUri(k)} propertyKey={k} />
                            </td>
                            <td className="px-4 py-2 border-b border-neutral-200 text-sm">
                              {renderValue(value[k], k, uuid)}
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

  const PropertyRenderer = ({ uri, propertyKey }: { uri: string; propertyKey: string }) => {
    return uri.startsWith('@') ? (
      uri
    ) : (
      <Link href={uri}>{propertyKey}</Link>
    )
  }

  const ValueRenderer = ({ 
    uri, 
    value, 
    propertyKey 
  }: { 
    uri: string; 
    value: any; 
    propertyKey: string;
  }) => {
    if (uri === "@type") {
      return <Link href={resolveUri(value)}>{value}</Link>
    }
    return renderValue(value, propertyKey)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr lang="en">
            <th className="px-4 py-3 text-left border-b border-neutral-200">Property</th>
            <th className="px-4 py-3 text-left border-b border-neutral-200">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(jsonLd).map(([key, value], index) => {
            const uri = resolveUri(key)
            return (
              <tr key={index}>
                <td lang="en" className="px-4 py-3 border-b border-neutral-200">
                  <PropertyRenderer uri={uri} propertyKey={key} />
                </td>
                <td className="px-4 py-3 border-b border-neutral-200">
                  <ValueRenderer uri={uri} value={value} propertyKey={key} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
