import React from 'react'
import { Badge } from '@sanity/ui'

const pickIcons = (url) => {
  switch(url) {
    case 'publicdomain' : 
      return (
        <Badge>Public domain</Badge>
      )
    case 'cc0' : 
      return (
        <Badge>CC Zero</Badge>
      )
    case 'streamingonly' : 
      return (
        <Badge>In copyright</Badge>
      )
    case 'https://creativecommons.org/licenses/by/4.0/' : 
      return (
        <Badge>CC BY</Badge>
      )
    case 'https://rightsstatements.org/vocab/InC-NC/1.0/' : 
      return (
        <Badge>Non-commercial use permitted</Badge>
      )
    case 'https://rightsstatements.org/vocab/CNE/1.0/' : 
      return (
        <Badge>Copyright not evaluated</Badge>
      )
    case 'https://rightsstatements.org/vocab/UND/1.0/' : 
      return (
        <Badge>Copyright undetermined</Badge>
      )
    default : 
      return (
        <Badge>Copyright not evaluated</Badge>
      )
  }
}

export default function License({license}) {
  if(!license) return null
  return pickIcons(license)
}
