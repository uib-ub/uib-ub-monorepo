// @ts-nocheck 
import { AddIcon } from '@sanity/icons'
import { Button, Flex, Menu, MenuButton, MenuItem, Text } from '@sanity/ui'
import { useFormValue, InputProps, WithReferringDocuments, useSchema, IntentButton, Preview, CompactPreview } from 'sanity'
import { IntentLink } from 'sanity/router'

const CreateNewRefInput = (props: InputProps) => {

  const { schemaType } = props
  /* @ts-ignore */
  const types = schemaType.to.map((t) => t.name)
  const actorID = useFormValue(['_id']) as string

  const schema = useSchema()

  return (
    <div>
      <WithReferringDocuments id={actorID}>
        {({ referringDocuments, isLoading }) => {
          if (isLoading) {
            return <div>Looking for referring documents...</div>
          }
          const activityDocuments = referringDocuments.filter((d) => types.includes(d._type))

          if (!activityDocuments.length) return null

          return (
            <div style={{ margin: '15px 0px' }}>
              {activityDocuments?.map((document) => {
                const schemaType = schema.get(document._type)

                return (
                  <div key={document._id} style={{ margin: '5px 0px' }}>
                    {schemaType ? (
                      <IntentButton intent="edit" params={{ id: document._id, type: document._type }}>
                        <Preview value={document} schemaType={schemaType} />
                      </IntentButton>
                    ) : (
                      <div>
                        A document of the unknown type <em>{document._type}</em>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }}
      </WithReferringDocuments>

      <Flex gap={2} wrap={'wrap'}>
        {/* You can also add the "Add new" tooltip like this https://www.sanity.io/ui/docs/primitive/tooltip */}{' '}
        <MenuButton
          button={<Button text="Add a new activity or event " />}
          id="menu-button-example"
          menu={(
            <Menu>
              {types.map((type: string) => (
                <MenuItem key={type} padding={1}>
                  <IntentLink
                    key={type}
                    intent="create"
                    params={[{ type: type, template: `activityStream-Actor-${type}` }, { actorID: actorID }]}
                  >
                    <Button
                      icon={AddIcon}
                      text={`Add new ${type}`}
                      mode="bleed"
                      width={'100%'}
                    />
                  </IntentLink>
                </MenuItem>
              ))}
            </Menu>
          )}
          placement="right"
          popover={{ portal: true }}
        />
      </Flex>
    </div>
  )
}

export default CreateNewRefInput
