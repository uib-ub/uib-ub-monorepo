import { nanoid } from 'nanoid'
import { startsWith } from "lodash"


/**
 * Maps signature to owner ID to create reference in Sanity Studio
 * @param {string} id 
 * @returns array
 */

export const mapOwner = (id) => {

  //  Manuscripts and Rare Books Collection ID in nt-studio
  if (startsWith(id, 'ubm')) {
    return [{
      _type: 'reference',
      _key: nanoid(),
      _ref: '93cb9a25-64bb-431c-9b1a-fa9ec1604230',
    }]
  }

  //  Manuscripts and Rare Books Collection ID in nt-studio
  if (startsWith(id, 'ubb-ms')) {
    return [{
      _type: 'reference',
      _key: nanoid(),
      _ref: '7e030fda-d679-4911-87e1-a7305b689cb6',
    }]
  }

  // Picture collection ID in nt-studio
  return [{
    _type: 'reference',
    _key: nanoid(),
    _ref: 'f87b4625-b4bf-4960-881c-f3292fa0afed',
  }]

}
