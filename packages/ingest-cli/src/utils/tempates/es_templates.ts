import client from '../../clients/es-client'
import { chcDataFieldTemplateComponent, chcCorePropertiesTemplateComponent, chcLabelTemplateComponent, chcMemberOfTemplateComponent, chcOwnersTemplateComponent, chcProductionTemplateComponent, chcSourceSettings } from '../indexers/mappings/chc'
import { chcTemplate } from '../indexers/templates'
import { ESResponse } from './types'

export const putTemplates = async (): Promise<ESResponse> => {
  try {
    // First, create all component templates
    const componentTemplates = [
      client.cluster.putComponentTemplate(chcSourceSettings),
      client.cluster.putComponentTemplate(chcCorePropertiesTemplateComponent),
      client.cluster.putComponentTemplate(chcDataFieldTemplateComponent),
      client.cluster.putComponentTemplate(chcLabelTemplateComponent),
      client.cluster.putComponentTemplate(chcOwnersTemplateComponent),
      client.cluster.putComponentTemplate(chcProductionTemplateComponent),
      client.cluster.putComponentTemplate(chcMemberOfTemplateComponent),
    ];
    const componentResults = await Promise.allSettled(componentTemplates);

    // Check for errors in component template creation
    const errors = componentResults.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      return componentResults.map(result =>
        result.status === 'fulfilled'
          ? { status: 'fulfilled', value: result.value }
          : { error: String(result.reason) }
      ) as ESResponse;
    }

    // Then, create the index template
    const indexResult = await client.indices.putIndexTemplate(chcTemplate);

    return [
      ...componentResults.map(result =>
        result.status === 'fulfilled'
          ? { status: 'fulfilled', value: result.value }
          : { error: String(result.reason) }
      ),
      { status: 'fulfilled', value: indexResult }
    ] as ESResponse;
  } catch (error) {
    console.error(error);
    return [{ error: String(error) }];
  }
}