import { BiTransfer } from 'react-icons/bi';
import { hasSender, transferred } from '../../../properties/object';
import { timestamp } from '../../../properties/datatype';
import { defineType } from 'sanity';

export default defineType({
  name: 'DataTransferEvent',
  type: 'object',
  title: 'Dataoverføringshendelse',
  icon: BiTransfer,
  fields: [
    transferred,
    hasSender,
    timestamp,
  ],
})
