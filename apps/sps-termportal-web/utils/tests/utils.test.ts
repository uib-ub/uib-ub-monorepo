import { describe, test, expect } from "vitest";
import {
  sum,
  intersectUnique,
  parseRelationsRecursively,
  deleteValueFromList,
} from "../utils";

describe("sum", () => {
  test("should return the sum of numbers in the array", () => {
    const numbers = [1, 2, 3, 4, 5];
    const result = sum(numbers);
    expect(result).toBe(15);
  });

  test("should return 0 if the array is empty", () => {
    const numbers: number[] = [];
    const result = sum(numbers);
    expect(result).toBe(0);
  });
});

describe("intersectUnique", () => {
  test("should return the unique intersection of two arrays, sorted by the order of the first array", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [5, 4, 6, 7, 8];
    const result = intersectUnique(a, b);
    expect(result).toEqual([4, 5]);
  });

  test("should return an empty array if there is no intersection", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const result = intersectUnique(a, b);
    expect(result).toEqual([]);
  });

  test("should handle arrays with duplicate values correctly", () => {
    const a = [1, 2, 2, 3, 4, 4, 5];
    const b = [5, 5, 4, 4, 6, 7, 8];
    const result = intersectUnique(a, b);
    expect(result).toEqual([4, 5]);
  });
});

describe("parseRelationsRecursively", () => {
  test("should create a nested dictionary with related resources", () => {
    const data = {
      "1": {
        relation: ["2", "3"],
      },
      "2": {
        relation: ["4", "5"],
      },
      "3": {
        relation: [],
      },
      "4": {
        relation: ["6"],
      },
      "5": {
        relation: [],
      },
      "6": {
        relation: [],
      },
    };

    const result = parseRelationsRecursively(data, "1", "relation", "nested");

    expect(result).toEqual({
      "2": {
        nested: {
          "4": {
            nested: {
              "6": {
                nested: null,
              },
            },
          },
          "5": {
            nested: null,
          },
        },
      },
      "3": {
        nested: null,
      },
    });
  });

  test("should return undefined if the starting point or relation does not exist", () => {
    const data = {};

    const result = parseRelationsRecursively(data, "1", "relation", "nested");

    expect(result).toBe(null);
  });
});

describe("deleteValueFromList", () => {
  test("should delete the value from the array and return true", () => {
    const arr = ["apple", "banana", "cherry"];
    const value = "banana";
    const result = deleteValueFromList(arr, value);
    expect(arr).toEqual(["apple", "cherry"]);
    expect(result).toBe(true);
  });

  test("should not delete anything and return false if the value does not exist in the array", () => {
    const arr = ["apple", "banana", "cherry"];
    const value = "mango";
    const result = deleteValueFromList(arr, value);
    expect(arr).toEqual(["apple", "banana", "cherry"]);
    expect(result).toBe(false);
  });
});
