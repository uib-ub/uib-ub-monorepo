'use client'
import { contentSettings } from "@/config/server-config"
import Link from "next/link"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { PiMagnifyingGlass, PiTreeView } from "react-icons/pi"


export default function TreeViewToggle() {
    const params = useParams()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [doc, setDoc] = useState<any>(null)

    useEffect(() => {
        if (params.uuid) {
          fetch(`/api/docs?dataset=${params.dataset}&docs=${params.uuid}`)
            .then(response => response.json())
            .then(data => setDoc(data.hits?.hits[0]))
        }
        else {
          setDoc(null)
        }
      }, [params.uuid, params.dataset])

    const backToSearchLink = () => {
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('parent')
        newParams.delete('display')
        if (contentSettings[params.dataset as string].display == 'table') {
          newParams.set('display', 'table')
        }
  
  
        const adm = ['adm3', 'adm2', 'adm1'].filter(adm => newParams.has(adm))
        if (newParams.has('adm') || params.uuid) {
          adm.forEach(a => newParams.delete(a))
        }
        else if (adm.length) {
          const admValues = adm.map(a => newParams.get(a))
          newParams.set('adm', admValues.join('__'))
  
          adm.forEach(a => newParams.delete(a))
        }
  
        return `${pathname}${newParams.toString() ? '?'+newParams.toString() : ''}`
      }
  
      const treeViewLink = () => {
        
        const newParams = new URLSearchParams(searchParams)
        
  
        if (newParams.getAll('adm').length == 1) {
          const adm = newParams.getAll('adm')[0].split('__').reverse()
          adm.forEach((a, i) => {
            newParams.set(`adm${i+1}`, a)
            }
          )
        }

        if (doc) {
          const {adm1, adm2, adm3} = doc._source
          
          // Fetch adm for document
          if (adm1) {
            newParams.set('adm1', adm1)
          }
          if (adm2) {
            newParams.set('adm2', adm2)
          }
          if (adm3) {
            newParams.set('adm3', adm3)
          }

          if (doc._source.within) {
            newParams.set('parent', doc._source.within)
          }
        }


  
        newParams.set('display', 'tree')
        
        return  `${pathname}${newParams.toString() ? '?'+newParams.toString() : ''}`
      }
    
    
    if (searchParams.get('display') == 'tree') {
        return (
            <Link className="btn btn-outline no-underline btn-compact !pl-2 ml-auto" href={backToSearchLink()}>
            <i>
              <PiMagnifyingGlass className="text-xl mr-2" aria-hidden="true"/>
            </i>
            Søk
            </Link>
        )
    }
    else {
        return (
             <Link type="button" className="btn btn-outline no-underline btn-compact !pl-2 ml-auto" href={treeViewLink()}>
            <i>
              <PiTreeView className="text-xl mr-2" aria-hidden="true"/>
            </i>
            Register
            </Link>

        )
    }

}