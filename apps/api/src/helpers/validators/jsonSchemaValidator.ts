// TODO: move to a shared location
import addFormats from "ajv-formats";
import Ajv from "ajv/dist/2020";
import * as core from 'types/src/la-schemas/core.json';
import * as object from 'types/src/la-schemas/object.json';
import * as person from 'types/src/la-schemas/person.json';

const jsonSchemaValidator = new Ajv()
addFormats(jsonSchemaValidator)
jsonSchemaValidator.addSchema(core, "core.json")
jsonSchemaValidator.addSchema(object, "object.json")
jsonSchemaValidator.addSchema(person, "person.json")

export default jsonSchemaValidator