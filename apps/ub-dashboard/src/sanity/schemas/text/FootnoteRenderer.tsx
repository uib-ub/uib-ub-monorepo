import React from 'react'
import PropTypes from 'prop-types'
import { GiNailedFoot } from 'react-icons/gi'

const FootnoteRenderer = (props: any) => (
  <span>
    {props.children} <GiNailedFoot />
  </span>
)

FootnoteRenderer.propTypes = {
  children: PropTypes.node.isRequired
}

export default FootnoteRenderer