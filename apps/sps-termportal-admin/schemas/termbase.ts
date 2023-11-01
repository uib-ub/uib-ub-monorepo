export default {
  name: 'termbase',
  type: 'document',
  title: 'Termbase',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
    },
    {
      name: 'id',
      type: 'string',
      title: 'ID',
    },
  ],
  preview: {
    select: {
      title: "name",
      id: "id"
    }
  }
}
