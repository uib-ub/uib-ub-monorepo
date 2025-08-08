import client from '../../../clients/es-client'
import { logger } from '../../logger'
import { pipelines } from '../pipelines'

export type EnsureIndexOptions = {
  index: string
  putTemplates: () => Promise<any>
}

function isTemplateError(obj: any): obj is { error: string } {
  return obj && typeof obj === 'object' && 'error' in obj;
}

export const putPipelines = async (): Promise<any[]> => {
  try {
    const pipelinePromises = Object.values(pipelines).map(pipeline =>
      client.ingest.putPipeline({
        id: pipeline.id,
        body: {
          description: pipeline.description,
          version: pipeline.version,
          processors: (pipeline as any).processors || []
        }
      })
    );

    const results = await Promise.allSettled(pipelinePromises);
    return results.map(result =>
      result.status === 'fulfilled'
        ? { status: 'fulfilled', value: result.value }
        : { error: String(result.reason) }
    );
  } catch (error) {
    console.error('Error creating pipelines:', error);
    return [{ error: String(error) }];
  }
}

export const ensureIndexAndTemplatesReady = async ({ index, putTemplates }: EnsureIndexOptions) => {
  // First, create pipelines
  const pipelineResult = await putPipelines();
  const hasPipelineError = Array.isArray(pipelineResult) && pipelineResult.some(isTemplateError);
  if (hasPipelineError) {
    throw new Error('Elasticsearch pipelines not set up correctly: ' + JSON.stringify(pipelineResult));
  }

  // Then, set up templates
  const templateResult = await putTemplates();
  const hasError = Array.isArray(templateResult) && templateResult.some(isTemplateError);
  if (hasError) {
    throw new Error('Elasticsearch templates not set up correctly: ' + JSON.stringify(templateResult));
  }
  // Ensure index exists
  const exists = await client.indices.exists({ index });
  if (!exists) {
    logger?.info ? logger.info(`Creating new index ${index}`) : console.log(`Creating new index ${index}`);
    await client.indices.create({ index });
  }
}; 