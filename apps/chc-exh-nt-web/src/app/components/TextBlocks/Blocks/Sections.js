import RenderSections from './RenderSection'

export default function Sections({ sections }) {
  return <>{sections && <RenderSections sections={sections} />}</>
}
