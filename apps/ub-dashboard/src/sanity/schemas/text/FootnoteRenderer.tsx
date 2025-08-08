import React from 'react'
import { GiNailedFoot } from 'react-icons/gi'

interface FootnoteRendererProps {
  children: React.ReactNode;
}

const FootnoteRenderer = (props: FootnoteRendererProps) => (
  <span>
    {props.children} <GiNailedFoot />
  </span>
)

export default FootnoteRenderer