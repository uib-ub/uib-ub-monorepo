import React from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'

interface ExternalLinkRendererProps {
  children: React.ReactNode;
}

const ExternalLinkRenderer = (props: ExternalLinkRendererProps) => (
  <span>
    {props.children} <FaExternalLinkAlt />
  </span>
)

export default ExternalLinkRenderer