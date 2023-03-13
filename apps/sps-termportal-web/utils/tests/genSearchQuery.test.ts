import { describe, test, expect } from "vitest";
import { getGraphData, getLanguageData, getTermData } from "../genSearchQuery";

describe("getTermData", () => {
  const highlight = { open: "<open>", close: "<close>" };
  const term = "(æbc)-<def>-[ghj]-1,2,";
  const tD = getTermData(term, highlight);
  test("term is term", () => {
    expect(tD.term).toBe(term);
  });
  test("sanitized removes", () => {
    expect(tD.sanitized()).toBe("æbc def ghj 1,2");
  });
  test("starred", () => {
    expect(tD.starred()).toBe("æbc* AND def* AND ghj* AND 1,2*");
  });
  test("doubleStarred", () => {
    expect(tD.doubleStarred()).toBe("*æbc* AND *def* AND *ghj* AND *1,2*");
  });
  test("termHL", () => {
    expect(tD.termHL()).toBe(
      "(<open>æbc<close>)-<<open>def<close>>-[<open>ghj<close>]-<open>1,2,<close>"
    );
  });
  test("termHLstart", () => {
    expect(tD.termHLstart()).toBe(
      "(<open>æbc<close>)-<<open>def<close>>-[<open>ghj<close>]-<open>1,2,"
    );
  });
  test("termHLend", () => {
    expect(tD.termHLend()).toBe(
      "(<open>æbc<close>)-<<open>def<close>>-[<open>ghj<close>]-<open>1,2,<close>"
    );
  });
  test("queryhighlight", () => {
    expect(tD.queryHighlight()).toBe("highlight:s:<open> | e:<close>");
  });
});

describe("getGraphData", () => {
  test("value is 'all' string", () => {
    expect(getGraphData(["all"], "all")).toStrictEqual(['',"<urn:x-arq:UnionGraph>"]);
  });
  test("value is valid key string", () => {
    expect(getGraphData(["all"], "MRT")).toStrictEqual(["", "ns:3000"]);
  });
  test("value is list of empty string", () => {
    expect(getGraphData(["all"], [])).toStrictEqual(["", "<urn:x-arq:UnionGraph>"]);
  });
  test("value is list of valid keys", () => {
    expect(getGraphData(["all"], ["MRT", "MRT2"])).toStrictEqual(
      ["\n  FROM NAMED ns:3000\n  FROM NAMED ns:3002", "?G"]
    );
  });
});

describe("getLanguageData", () => {
  test("value is empty string", () => {
    expect(getLanguageData("")).toStrictEqual([""]);
  });
  test("value is string", () => {
    expect(getLanguageData("en")).toStrictEqual(["en"]);
  });
  test("value is string[]", () => {
    expect(getLanguageData(["en"])).toStrictEqual(["en"]);
  });
});
