import React from 'react'
import PropTypes from 'prop-types'
import * as SectionComponents from '.'

function resolveSections(section) {
  const Section = SectionComponents[section._type]

  if (Section) {
    return Section
  }

  console.error('Cant find section', section) // eslint-disable-line no-console
  return null
}

function RenderSections(props) {
  const { sections } = props

  const filteredSections = sections.filter((x) => x._type)

  if (!filteredSections) {
    console.error('Missing section')
    return <div>Missing sections</div>
  }

  return (
    <>
      {filteredSections.map((section, i) => {
        const SectionComponent = resolveSections(section)
        if (!SectionComponent) {
          return (
            <div key={i} status="error">
              <div className='text-bold mr-3'>Missing section!</div>
              <p>
                Add new section called <pre>{section._type}</pre>.
              </p>
            </div>
          )
        }
        return <SectionComponent {...section} key={section._key} />
      })}
    </>
  )
}

RenderSections.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      _type: PropTypes.string,
      _key: PropTypes.string,
      section: PropTypes.instanceOf(PropTypes.object),
    }),
  ),
}

export default RenderSections
