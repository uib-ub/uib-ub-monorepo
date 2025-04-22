// Tests
import { expect, mock, test } from "bun:test";
import { z } from 'zod';
import { createValidItem, getCopyright } from './getCopyright';

test("getCopyright", () => {
  test("should return null for an item without subject_to", () => {
    const item = createValidItem([]);
    expect(getCopyright(item, 'some-id')).toBeNull();
  });

  test("should return null when no matching right is found", () => {
    const item = createValidItem([{ id: 'other-id', inheritFrom: 'inherited-id' }]);
    expect(getCopyright(item, 'some-id')).toBeNull();
  });

  test("should return the inherited copyright ID when a matching right is found", () => {
    const item = createValidItem([{ id: 'some-id', inheritFrom: 'inherited-id' }]);
    expect(getCopyright(item, 'some-id')).toBe('inherited-id');
  });

  test("should return null when a matching right is found but has no inherit_from", () => {
    const item = createValidItem([{ id: 'some-id' }]);
    expect(getCopyright(item, 'some-id')).toBeNull();
  });

  test("should handle multiple rights in subject_to", () => {
    const item = createValidItem([
      { id: 'id-1', inheritFrom: 'inherited-1' },
      { id: 'id-2', inheritFrom: 'inherited-2' },
    ]);
    expect(getCopyright(item, 'id-2')).toBe('inherited-2');
  });

  test("should return null for invalid item structure", () => {
    const consoleSpy = mock(() => { });
    console.warn = consoleSpy;
    const item = { subject_to: 'invalid' };
    expect(getCopyright(item, 'some-id')).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid item structure:',
      expect.any(z.ZodError)
    );
  });

  test("should return null for completely invalid input", () => {
    const consoleSpy = mock(() => { });
    console.warn = consoleSpy;
    expect(getCopyright(null, 'some-id')).toBeNull();
    expect(getCopyright(undefined, 'some-id')).toBeNull();
    expect(getCopyright(42, 'some-id')).toBeNull();
    expect(getCopyright('not an object', 'some-id')).toBeNull();
    expect(consoleSpy).toHaveBeenCalledTimes(4);
  });
});