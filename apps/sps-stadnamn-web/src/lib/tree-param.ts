export type ParsedTreeParam = {
  dataset?: string
  adm1?: string
  adm2?: string
  uuid?: string
}

/**
 * Parses the new `tree` URL param, which is the single source of truth for cadastral navigation.
 *
 * Format:
 * - (unset/empty): {}
 * - dataset
 * - dataset_adm1
 * - dataset_adm1_adm2
 * - dataset_adm1_adm2_uuid
 */
export function parseTreeParam(tree: string | null): ParsedTreeParam {
  const raw = (tree || '').trim()
  if (!raw) return {}
  // Root state: show datasets that support cadastral view
  if (raw === 'root') return {}

  const parts = raw.split('_')
  const dataset = parts[0]
  const adm1 = parts.length >= 2 ? parts[1] : undefined
  const adm2 = parts.length >= 3 ? parts[2] : undefined
  const uuid = parts.length >= 4 ? parts[3] : undefined

  return { dataset, adm1, adm2, uuid }
}

export function buildTreeParam({ dataset, adm1, adm2, uuid }: ParsedTreeParam): string | null {
  if (!dataset) return null
  const parts = [dataset]
  if (adm1) parts.push(adm1)
  if (adm2) parts.push(adm2)
  if (uuid) parts.push(uuid)
  return parts.join('_')
}


