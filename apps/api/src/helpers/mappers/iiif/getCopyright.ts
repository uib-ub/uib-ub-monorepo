import { z } from 'zod';

// Define schema for our data structures
const RightSchema = z.object({
  id: z.string(),
  inherit_from: z.object({ id: z.string() }).optional(),
});

const ItemSchema = z.object({
  subject_to: z.array(RightSchema).optional(),
});

type Item = z.infer<typeof ItemSchema>;

/**
 * Retrieves the copyright information in the prop inherit_from for an item based on its subject_to property.
 * 
 * @param item - The item to retrieve the copyright information from.
 * @param id - The ID of the copyright to retrieve.
 * @returns The ID of the inherited copyright or null if no copyright is found.
 */
export function getCopyright(item: unknown, id: string): string | null {
  try {
    const validatedItem = ItemSchema.parse(item);

    if (!validatedItem.subject_to || validatedItem.subject_to.length === 0) {
      return null;
    }

    const right = validatedItem.subject_to.find(r => r.id === id);

    return right?.inherit_from?.id ?? null;
  } catch (error) {
    console.warn('Invalid item structure:', error);
    return null;
  }
}

// Function to create a valid item for testing purposes
export function createValidItem(rights: Array<{ id: string, inheritFrom?: string }>): Item {
  return {
    subject_to: rights.map(right => ({
      id: right.id,
      ...(right.inheritFrom ? { inherit_from: { id: right.inheritFrom } } : {})
    }))
  };
}