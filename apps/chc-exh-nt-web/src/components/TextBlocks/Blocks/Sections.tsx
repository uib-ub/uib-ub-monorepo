import RenderSections from './RenderSection'

export default function Sections({ sections }: any) {
  return <>{sections && <RenderSections sections={sections} />}</>
}
