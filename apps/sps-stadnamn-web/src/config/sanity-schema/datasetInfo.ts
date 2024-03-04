const datasetInfo =  {
    name: 'dataset',
    type: 'document',
    title: 'Dataset Info',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Tittel'
        },
        {
            name: 'description',
            type: 'text',
            title: 'ingress'
        },
        {
            title: 'Beskrivelse', 
            name: 'content',
            type: 'array', 
            of: [{type: 'block'}]
        },
        
    ]
}
export default datasetInfo