import { describe, test, expect } from "vitest";
import { intersectUnique, sum, } from "../utils";

describe("sum" , () => {
test("empty list", () => {
  expect(sum([])).toBe(0)
})

})

describe("intersectUnique", () => {
  test("order any[]", () => {
    expect(intersectUnique(["a", 1, "c"], ["c", 1])).toStrictEqual([
      1,
      "c",
    ]);
  });
  test("empty a", () => {
    expect(intersectUnique([], ["c", "b"])).toStrictEqual([]);
  });
});
