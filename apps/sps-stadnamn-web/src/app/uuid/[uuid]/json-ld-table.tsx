import Link from 'next/link'
import { PiArrowRight } from 'react-icons/pi'

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
        
        if (Object.keys(value).length > 1) {
          return (
            <ul className="min-w-full divide-y divide-neutral-100 pl-4 border-l border-neutral-300 text-sm" key={value['id']}>
              <li className="flex">
                <span lang="en" className="w-1/4 px-4 py-2 font-medium">id</span>
                {value['id'].startsWith('_:') ? (
                  <span className="px-4 py-2">{value['id']}</span>
                ) : (
                  <Link 
                    lang="en" 
                    href={value['id']} 
                    className="px-4 py-2 hover:text-black underline"
                  >
                    {value['id']}
                  </Link>
                )}
              </li>
              {Object.keys(value)
                .filter(k => k !== 'id')
                .map(k => (
                  <li key={`${value['id']}-${k}`} className="flex">
                    <div lang="en" className="w-1/4 px-4 py-2 font-medium">
                      <PropertyRenderer uri={resolveUri(k)} propertyKey={k} />
                    </div>
                    <div className="px-4 py-2">
                      {k === 'type' ? (
                        <Link href={resolveUri(value[k])}>{value[k]}</Link>
                      ) : (
                        renderValue(value[k], k, uuid)
                      )}
                    </div>
                  </li>
                ))}
            </ul>
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
              <div lang="en" className="text-sm ">
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
    return uri.startsWith('@') || uri.startsWith('_:') ? (
      propertyKey
    ) : (
      <Link href={uri} className="hover:text-black underline">{propertyKey}</Link>
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
    if (uri === "@type" || propertyKey === "type") {
      return <Link href={resolveUri(value)}>{value}</Link>
    }
    return renderValue(value, propertyKey)
  }

  return (
    <ul className="min-w-full divide-y divide-neutral-200 pl-4 border-y border-neutral-300 text-sm">
      {Object.entries(jsonLd).map(([key, value], index) => {
        const uri = resolveUri(key)
        return (
          <li key={index} className="flex">
            <span lang="en" className="w-1/4 px-4 py-3">
              <PropertyRenderer uri={uri} propertyKey={key} />
            </span>
            <span className="px-4 py-3">
              <ValueRenderer uri={uri} value={value} propertyKey={key} />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
