// TODO: move to a shared location
import * as object from 'types/src/la-schemas/object.json';
import * as core from 'types/src/la-schemas/core.json';
import Ajv from "ajv/dist/2020"
import addFormats from "ajv-formats"

const ajv = new Ajv()
addFormats(ajv)
ajv.addSchema(core, "core.json")
ajv.addSchema(object, "object.json")

export default ajv