/* 

{ type: 'TransferOfMember' },
{ type: 'Leaving' },
{ type: 'Death' },

*/

export const templates = [
  {
    id: 'activityStream-Actor-Activity',
    title: 'Activity',
    description: '...',
    schemaType: 'Activity',
    parameters: [
      { name: 'actorID', type: 'string' }
    ],
    value: (params: any) => {
      console.log(params)
      return {
        hadParticipant: [
          {
            _ref: params.actorID,
            _type: 'reference',
          }
        ],
      }
    },
  },
  {
    id: 'activityStream-Actor-Birth',
    title: 'Birth',
    description: '...',
    schemaType: 'Birth',
    parameters: [
      { name: 'actorID', type: 'string' }
    ],
    value: (params: any) => {
      console.log(params)
      return {
        birthOf: [
          {
            _ref: params.actorID,
            _type: 'reference',
          }
        ],
      }
    },
  },
  {
    id: 'activityStream-Actor-Death',
    title: 'Death',
    description: '...',
    schemaType: 'Death',
    parameters: [
      { name: 'actorID', type: 'string' }
    ],
    value: (params: any) => {
      console.log(params)
      return {
        deathOf: [
          {
            _ref: params.actorID,
            _type: 'reference',
          }
        ],
      }
    },
  },
  {
    id: 'activityStream-Actor-Joining',
    title: 'Joining',
    description: '...',
    schemaType: 'Joining',
    parameters: [
      { name: 'actorID', type: 'string' }
    ],
    value: (params: any) => {
      console.log(params)
      return {
        joined: [
          {
            _ref: params.actorID,
            _type: 'reference',
          }
        ],
      }
    },
  },
  {
    id: 'activityStream-Actor-Leaving',
    title: 'Leaving',
    description: '...',
    schemaType: 'Leaving',
    parameters: [
      { name: 'actorID', type: 'string' }
    ],
    value: (params: any) => {
      console.log(params)
      return {
        separated: [
          {
            _ref: params.actorID,
            _type: 'reference',
          }
        ],
      }
    },
  },
  {
    id: 'activityStream-Actor-TransferOfMember',
    title: 'TransferOfMember',
    description: '...',
    schemaType: 'TransferOfMember',
    parameters: [
      { name: 'actorID', type: 'string' }
    ],
    value: (params: any) => {
      console.log(params)
      return {
        transferred: [
          {
            _ref: params.actorID,
            _type: 'reference',
          }
        ],
      }
    },
  },
]