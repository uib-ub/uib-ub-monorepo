import { observeClient } from '@config/apis/esClient';
import { env } from '@config/env';
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes';
import { convertToFloat } from '@helpers/cleaners/convertToFloat';
import { useFrame } from '@helpers/useFrame';
import { toLinkedArtItemTransformer } from '@transformers/item.transformer';
import { HTTPException } from 'hono/http-exception';
import { ContextDefinition, JsonLdDocument } from 'jsonld';
import ubbontContext from 'jsonld-contexts/src/ubbontContext';
import { ZodHumanMadeObjectSchema } from 'types';

export const convertAndValidateLaItem = async (data: any): Promise<any> => {
  if (!data) {
    console.error('No data provided');
    return
  }

  try {
    // We clean up the result before returning it
    const fixedDates = cleanDateDatatypes(data);
    const withFloats = convertToFloat(fixedDates);

    const framed: JsonLdDocument = await useFrame({
      data: withFloats,
      context: ubbontContext as ContextDefinition,
      type: 'HumanMadeObject',
      id: data.id
    });

    delete framed['@context'];

    const response = await toLinkedArtItemTransformer(
      framed,
      `${env.API_URL}/ns/ubbont/context.json`
    );

    const parsed = ZodHumanMadeObjectSchema.safeParse(response);
    if (parsed.success === false) {
      console.log(response.id ?? data['@id'], parsed.error.issues);
      observeClient.index({
        index: 'logs-chc',
        body: {
          '@timestamp': new Date(),
          message: `id: ${response.id ?? data['@id']}, issues: ${JSON.stringify(parsed.error.issues)}`
        }
      });
    }

    return response;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
};
