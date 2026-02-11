import { CustomValidatorResult, ValidationContext } from 'sanity'

const uniqueValueQuery =
  '!defined(*[_type==$type && value==$value && !(_id in [$draftId, $publishedId])][0]._id)';

const uniqueLabelQuery =
  '!defined(*[_type==$type && value==$value && !(_id in [$draftId, $publishedId])][0]._id)';


const executeQuery = async (
  ctx: ValidationContext,
  query: string,
  value?: string,
) => {
  const { document } = ctx;
  if (!value || !document) return true;
  const id = document._id.replace('drafts.', '');
  const params = {
    type: document._type,
    value,
    draftId: `drafts.${id}`,
    publishedId: id,
  };
  return await ctx
    .getClient({ apiVersion: '2023-01-01' })
    .fetch(query, params);
};

export const isUniqueValue = async (
  value: string | undefined,
  ctx: ValidationContext,
): Promise<CustomValidatorResult> => {
  const isUnique = await executeQuery(ctx, uniqueValueQuery, value);
  return isUnique
    ? true
    : 'URL must be unique, this one has already been registered.';
};

export const isUniqueLabel = async (
  value: string | undefined,
  ctx: ValidationContext,
): Promise<CustomValidatorResult> => {
  const isUnique = await executeQuery(ctx, uniqueLabelQuery, value);
  return isUnique
    ? true
    : 'URL must be unique, this one has already been registered.';
};