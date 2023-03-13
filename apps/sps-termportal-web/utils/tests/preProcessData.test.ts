import { describe, test, expect } from "vitest";
import { updateLabel } from "../preprocessData";

describe("update Label", () => {
  const inData = {
    concept: {
      prefLabel: ["prefLabel_nb_1", "prefLabel_nb_2", "prefLabel_en_1"],
    },
    prefLabel_nb_1: { literalForm: { value: "teststring", "@language": "nb" } },
    prefLabel_nb_2: {
      literalForm: { value: "teststring2", "@language": "nb" },
    },
    prefLabel_en_1: { literalForm: { value: "teststring", "@language": "en" } },
  };
  test("update complete data", () => {
    const outData = {
      nb: ["prefLabel_nb_1", "prefLabel_nb_2"],
      en: ["prefLabel_en_1"],
    };
    expect(updateLabel(inData, "concept", "prefLabel")).toStrictEqual(outData);
  });
});
