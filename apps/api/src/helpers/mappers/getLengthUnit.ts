import { aatCMUnitType } from './staticMapping';

/**
 * Get length and unit from a string like "10 cm", wherethe unit is optional
 * Returns an object with length and unit
 * @param {string} str - The string to extract the length and unit from
 * @returns {object} - An object with length, unit and isApproximation
 * @example
 * getLengthUnit("10 cm") // { value: 10, unit: { id: 'http://vocab.getty.edu/aat/300379098', type: 'MeasurementUnit', _label: 'centimeters' }, isApproximation: false }
 * getLengthUnit("ca 10 cm") // { value: 10, unit: { id: 'http://vocab.getty.edu/aat/300379098', type: 'MeasurementUnit', _label: 'centimeters' }, isApproximation: true }
 * getLengthUnit("10") // { value: NaN, unit: {}, isApproximation: false }
 * getLengthUnit("10 mm") // { value: 1, unit: { id: 'http://vocab.getty.edu/aat/300379098', type: 'MeasurementUnit', _label: 'centimeters' }, isApproximation: false }
 * getLengthUnit("ca 10 mm") // { value: 1, unit: { id: 'http://vocab.getty.edu/aat/300379098', type: 'MeasurementUnit', _label: 'centimeters' }, isApproximation: true }
 * getLengthUnit("ca 10") // { value: 10, unit: { id: 'http://vocab.getty.edu/aat/300379098', type: 'MeasurementUnit', _label: 'centimeters' }, isApproximation: true }
 */
export function getLengthUnit(str: string): { value: number, unit: any, isApproximation: boolean } {
  const isApproximation = String(str).startsWith("ca");
  const measurement = str.replace("ca ", "");
  const value = parseInt(measurement) ?? NaN;

  // Split the string into an array with length of two, with number and unit
  const matchResult = RegExp(/(\d+)\s*(\w*)/).exec(measurement);


  if (isNaN(value)) {
    return {
      value: NaN,
      unit: {},
      isApproximation
    };
  }

  const unit = matchResult ? matchResult[2] : "";

  return {
    value: unit === 'mm' ? value / 10 : value,
    unit: aatCMUnitType,
    isApproximation
  };
}
